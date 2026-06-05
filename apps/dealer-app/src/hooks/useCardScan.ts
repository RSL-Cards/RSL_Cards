import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cardService,
  inventoryService,
  type ScanResponse,
  type EbaySoldResponse,
  type AddInventoryItem,
  type AddInventoryResponse,
} from "../services/cardService";
import { useDealTabStore } from "../stores/dealTabStore";
import { useAuthStore } from "../stores/authStore";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

export const QUERY_KEYS = {
  ebaySold: (query: string) => ["ebay", "sold", query] as const,
  ebaySearch: (query: string) => ["ebay", "search", query] as const,
  inventory: (userId: string) => ["inventory", userId] as const,
};

export function useCardScan(type: "buy" | "sell" = "buy") {
  const router = useRouter();
  const addTab = useDealTabStore((s) => s.addTab);

  return useMutation<ScanResponse, Error, string>({
    mutationFn: (imageBase64: string) => cardService.scanImage(imageBase64),
    onSuccess: (data, imageBase64) => {
      const tabId = addTab({
        type,
        step: 2,
        cardData: data.card,
        cardId: data.cardId,
        variantId: data.variantId,
        playerId: data.playerId,
        capturedPhoto: imageBase64,
      });
      const source = data.fromCache ? "📦 From DB cache" : "🤖 Gemini AI";
      console.log("[SCAN] full response:", JSON.stringify(data, null, 2));
      console.log(
        `[SCAN] source=${source} cardId=${data.cardId} variantId=${data.variantId} confidence=${data.confidence}`,
      );
      Toast.show({
        type: "success",
        text1: `Card identified! ${source}`,
        text2: `${data.card.player_name} — ${Math.round(data.confidence * 100)}% confidence`,
      });
      if (type === "buy") {
        router.push("/buy/comps");
      } else {
        router.push("/sell/price");
      }
    },
    onError: (error: any) => {
      console.log("[SCAN ERROR] status:", error?.response?.status);
      console.log("[SCAN ERROR] data:", JSON.stringify(error?.response?.data));
      console.log("[SCAN ERROR] message:", error?.message);
      const status = error?.response?.status;
      if (status === 429) {
        Toast.show({
          type: "error",
          text1: "Rate limit hit",
          text2: "Wait 30-60s and try again.",
        });
      } else {
        const message =
          error?.response?.data?.message ??
          "Could not identify card. Try again.";
        Toast.show({ type: "error", text1: "Scan failed", text2: message });
      }
    },
  });
}

export function useBarcodeScan() {
  const router = useRouter();
  const addTab = useDealTabStore((s) => s.addTab);

  return useMutation<ScanResponse, Error, string>({
    mutationFn: (barcode: string) => cardService.scanBarcode(barcode),
    onSuccess: (data) => {
      addTab({
        type: "buy",
        step: 2,
        cardData: data.card,
        cardId: data.cardId,
        variantId: data.variantId,
      });
      Toast.show({
        type: "success",
        text1: "Card found!",
        text2: data.card.player_name,
      });
      router.push("/buy/comps");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ?? "Could not find card. Try again.";
      Toast.show({
        type: "error",
        text1: "Barcode scan failed",
        text2: message,
      });
    },
  });
}

export function useEbaySold(
  query: string,
  options?: {
    enabled?: boolean;
    limit?: number;
    variantId?: string;
    gradeKey?: string;
  },
) {
  return useQuery<EbaySoldResponse, Error>({
    queryKey: [
      ...QUERY_KEYS.ebaySold(query),
      options?.variantId,
      options?.gradeKey,
    ],
    queryFn: () =>
      cardService.getEbaySold(
        query,
        options?.limit ?? 10,
        options?.variantId,
        options?.gradeKey,
      ),
    enabled: (options?.enabled ?? true) && query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useMyslabsSold(
  query: string,
  options?: {
    enabled?: boolean;
    limit?: number;
    variantId?: string;
    gradeKey?: string;
  },
) {
  return useQuery({
    queryKey: ["myslabs", "sold", query, options?.variantId, options?.gradeKey],
    queryFn: () =>
      cardService.getMyslabsSold(
        query,
        options?.limit ?? 10,
        options?.variantId,
        options?.gradeKey,
      ),
    enabled: (options?.enabled ?? true) && query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useEbaySearch(query: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.ebaySearch(query),
    queryFn: () => cardService.searchEbay(query),
    enabled: (options?.enabled ?? true) && query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useAddToInventory() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id ?? "");

  return useMutation<AddInventoryResponse, Error, AddInventoryItem>({
    mutationFn: (item) => inventoryService.addItem(item),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory(userId) });
      queryClient.invalidateQueries({
        queryKey: ["analytics", "daily", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["analytics", "today-activity", userId],
      });
      Toast.show({
        type: "success",
        text1: "Added to inventory",
        text2: "Your card has been saved successfully.",
      });
    },
    onError: (error: any) => {
      console.log("[INVENTORY ERROR] status:", error?.response?.status);
      console.log(
        "[INVENTORY ERROR] data:",
        JSON.stringify(error?.response?.data),
      );
      console.log("[INVENTORY ERROR] message:", error?.message);
      const message =
        error?.response?.data?.message ?? "Failed to add card to inventory";
      const is409 = error?.response?.status === 409;
      Toast.show({
        type: is409 ? "info" : "error",
        text1: is409 ? "Already in inventory" : "Error",
        text2: message,
      });
    },
  });
}

export function useInventoryItem(id: string) {
  const userId = useAuthStore((s) => s.user?.id ?? "");

  return useQuery({
    queryKey: [...QUERY_KEYS.inventory(userId), "item", id],
    queryFn: () => inventoryService.getItem(id),
    enabled: !!userId && !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useInventory(params?: {
  sport?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const userId = useAuthStore((s) => s.user?.id ?? "");

  return useQuery({
    queryKey: [...QUERY_KEYS.inventory(userId), params],
    queryFn: () => inventoryService.list(params),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useInventorySummary() {
  const userId = useAuthStore((s) => s.user?.id ?? "");

  return useQuery({
    queryKey: [...QUERY_KEYS.inventory(userId), "summary"],
    queryFn: () => inventoryService.getSummary(),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}
