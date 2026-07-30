import { create } from "zustand";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { apiClient } from "../lib/apiClient";
import Toast from "react-native-toast-message";

export interface PendingTransaction {
  localId: string;
  type: "buy" | "sell" | "trade";
  payload: any;
  createdAt: string;
  status: "pending" | "failed";
  error?: string;
}

export interface PendingExpense {
  localId: string;
  payload: any;
  createdAt: string;
  status: "pending" | "failed";
  error?: string;
}

export interface SyncedItem {
  localId: string;
  type: "transaction" | "expense";
  description: string;
  timestamp: string;
}

interface SyncStore {
  pendingTransactions: PendingTransaction[];
  pendingExpenses: PendingExpense[];
  syncedItems: SyncedItem[];
  isSyncing: boolean;
  syncStatus: "idle" | "syncing" | "success" | "failed";
  
  addPendingTransaction: (type: "buy" | "sell" | "trade", payload: any) => string;
  addPendingExpense: (payload: any) => string;
  syncNow: (queryClient?: any) => Promise<void>;
  retryFailed: (queryClient?: any) => Promise<void>;
  clearFailed: () => void;
  init: (queryClient?: any) => Promise<void>;
}

const STORAGE_KEY = "rsl_sync_store_data";

export const useSyncStore = create<SyncStore>((set, get) => {
  // Helper to save state to disk
  const saveToDisk = async (state: any) => {
    try {
      const data = JSON.stringify({
        pendingTransactions: state.pendingTransactions,
        pendingExpenses: state.pendingExpenses,
        syncedItems: state.syncedItems,
      });
      await AsyncStorage.setItem(STORAGE_KEY, data);
    } catch (err) {
      console.error("[SYNC STORE] Failed to save to disk:", err);
    }
  };

  return {
    pendingTransactions: [],
    pendingExpenses: [],
    syncedItems: [],
    isSyncing: false,
    syncStatus: "idle",

    addPendingTransaction: (type, payload) => {
      const localId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newTx: PendingTransaction = {
        localId,
        type,
        payload,
        createdAt: new Date().toISOString(),
        status: "pending",
      };

      const updatedTxs = [...get().pendingTransactions, newTx];
      set({ pendingTransactions: updatedTxs });
      saveToDisk({ ...get(), pendingTransactions: updatedTxs });

      // Try automatic sync if connected
      NetInfo.fetch().then((state) => {
        if (state.isConnected) {
          get().syncNow();
        }
      });

      return localId;
    },

    addPendingExpense: (payload) => {
      const localId = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newExp: PendingExpense = {
        localId,
        payload,
        createdAt: new Date().toISOString(),
        status: "pending",
      };

      const updatedExps = [...get().pendingExpenses, newExp];
      set({ pendingExpenses: updatedExps });
      saveToDisk({ ...get(), pendingExpenses: updatedExps });

      // Try automatic sync if connected
      NetInfo.fetch().then((state) => {
        if (state.isConnected) {
          get().syncNow();
        }
      });

      return localId;
    },

    syncNow: async (queryClient) => {
      if (get().isSyncing) return;

      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        console.log("[SYNC STORE] Sync skipped: Offline");
        return;
      }

      // Automatically reset any previously failed items back to pending when online
      const currentPendingTxs = get().pendingTransactions.map((t) =>
        t.status === "failed" ? { ...t, status: "pending" as const, error: undefined } : t
      );
      const currentPendingExps = get().pendingExpenses.map((e) =>
        e.status === "failed" ? { ...e, status: "pending" as const, error: undefined } : e
      );

      set({
        pendingTransactions: currentPendingTxs,
        pendingExpenses: currentPendingExps,
      });

      const txsToSync = currentPendingTxs.filter((t) => t.status === "pending");
      const expsToSync = currentPendingExps.filter((e) => e.status === "pending");

      if (txsToSync.length === 0 && expsToSync.length === 0) {
        set({ syncStatus: "idle" });
        return;
      }

      set({ isSyncing: true, syncStatus: "syncing" });

      try {
        const response = await apiClient.post("/v1/transactions/sync", {
          transactions: txsToSync,
          expenses: expsToSync,
        });

        const results = response.data;
        const syncedTxsResult = results.transactions || [];
        const syncedExpsResult = results.expenses || [];

        let currentTxs = [...get().pendingTransactions];
        let currentExps = [...get().pendingExpenses];
        let currentSyncedItems = [...get().syncedItems];

        // 1. Process Transaction results
        for (const res of syncedTxsResult) {
          const matchedTxIndex = currentTxs.findIndex((t) => t.localId === res.localId);
          if (matchedTxIndex === -1) continue;

          const matchedTx = currentTxs[matchedTxIndex];

          if (res.status === "success" || res.status === "synced") {
            // Remove from pending
            currentTxs.splice(matchedTxIndex, 1);
            
            // Add description
            const desc = matchedTx.type === "buy" 
              ? `Bought ${matchedTx.payload.playerName || "Card"}`
              : matchedTx.type === "sell"
                ? `Sold ${matchedTx.payload.playerName || "Card"}`
                : `Trade transaction`;

            currentSyncedItems.unshift({
              localId: res.localId,
              type: "transaction",
              description: desc,
              timestamp: new Date().toISOString(),
            });
          } else {
            // Marked as failed
            currentTxs[matchedTxIndex] = {
              ...matchedTx,
              status: "failed",
              error: res.error || "Unknown synchronization error",
            };
          }
        }

        // 2. Process Expense results
        for (const res of syncedExpsResult) {
          const matchedExpIndex = currentExps.findIndex((e) => e.localId === res.localId);
          if (matchedExpIndex === -1) continue;

          const matchedExp = currentExps[matchedExpIndex];

          if (res.status === "success" || res.status === "synced") {
            currentExps.splice(matchedExpIndex, 1);

            currentSyncedItems.unshift({
              localId: res.localId,
              type: "expense",
              description: `Expense: ${matchedExp.payload.category} - $${matchedExp.payload.amount}`,
              timestamp: new Date().toISOString(),
            });
          } else {
            currentExps[matchedExpIndex] = {
              ...matchedExp,
              status: "failed",
              error: res.error || "Unknown synchronization error",
            };
          }
        }

        // Cap history to 50 items
        if (currentSyncedItems.length > 50) {
          currentSyncedItems = currentSyncedItems.slice(0, 50);
        }

        const hasFailedItems =
          currentTxs.some((t) => t.status === "failed") ||
          currentExps.some((e) => e.status === "failed");

        set({
          pendingTransactions: currentTxs,
          pendingExpenses: currentExps,
          syncedItems: currentSyncedItems,
          syncStatus: hasFailedItems ? "failed" : "success",
        });

        await saveToDisk({
          pendingTransactions: currentTxs,
          pendingExpenses: currentExps,
          syncedItems: currentSyncedItems,
        });

        // Trigger updates across screens if queryClient is available
        if (queryClient) {
          queryClient.invalidateQueries();
        }

        if (!hasFailedItems) {
          Toast.show({
            type: "success",
            text1: "Sync Complete",
            text2: "All offline records synced successfully!",
          });
        }
      } catch (err: any) {
        console.error("[SYNC STORE] Sync failed:", err);
        set({ syncStatus: "failed" });
      } finally {
        set({ isSyncing: false });
      }
    },

    retryFailed: async (queryClient) => {
      const resetTxs = get().pendingTransactions.map((t) =>
        t.status === "failed" ? { ...t, status: "pending" as const, error: undefined } : t
      );
      const resetExps = get().pendingExpenses.map((e) =>
        e.status === "failed" ? { ...e, status: "pending" as const, error: undefined } : e
      );

      set({
        pendingTransactions: resetTxs,
        pendingExpenses: resetExps,
      });

      await saveToDisk({
        pendingTransactions: resetTxs,
        pendingExpenses: resetExps,
        syncedItems: get().syncedItems,
      });

      await get().syncNow(queryClient);
    },

    clearFailed: () => {
      const clearedTxs = get().pendingTransactions.filter((t) => t.status !== "failed");
      const clearedExps = get().pendingExpenses.filter((e) => e.status !== "failed");

      set({
        pendingTransactions: clearedTxs,
        pendingExpenses: clearedExps,
      });

      saveToDisk({
        pendingTransactions: clearedTxs,
        pendingExpenses: clearedExps,
        syncedItems: get().syncedItems,
      });
    },

    init: async (queryClient) => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          set({
            pendingTransactions: parsed.pendingTransactions || [],
            pendingExpenses: parsed.pendingExpenses || [],
            syncedItems: parsed.syncedItems || [],
          });
        }
      } catch (err) {
        console.error("[SYNC STORE] Init failed:", err);
      }

      // 1. Auto-trigger sync when connectivity returns
      NetInfo.addEventListener((state) => {
        if (state.isConnected) {
          get().syncNow(queryClient);
        }
      });

      // 2. Auto-trigger sync when app comes back to foreground
      AppState.addEventListener("change", (nextState) => {
        if (nextState === "active") {
          get().syncNow(queryClient);
        }
      });

      // 3. Periodic background check every 20 seconds
      setInterval(() => {
        const hasPending =
          get().pendingTransactions.length > 0 || get().pendingExpenses.length > 0;
        if (hasPending) {
          get().syncNow(queryClient);
        }
      }, 20000);
    },
  };
});
