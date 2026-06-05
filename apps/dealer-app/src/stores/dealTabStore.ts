import { create } from "zustand";

export interface DealTab {
  id: string;
  type: "buy" | "sell";
  step: number;
  cardData?: any;
  cardId?: string;
  variantId?: string;
  playerId?: string;
  price?: number;
  avgComp?: number;
  paymentMethod?: string;
  channel?: string;
  capturedPhoto?: string;
  recentSales?: any[];
  myslabsRecentSales?: any[];
  createdAt: string;
  bestMatchImageUrl?: string;
  activeListings?: any[];
  myslabsActiveListings?: any[];
}

interface DealTabStore {
  tabs: DealTab[];
  addTab: (tab: Omit<DealTab, "id" | "createdAt">) => string;
  updateTab: (id: string, updates: Partial<DealTab>) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
}

export const useDealTabStore = create<DealTabStore>((set, get) => ({
  tabs: [],
  addTab: (tab) => {
    const id = `deal-${Date.now()}`;
    const tabs = get().tabs;
    const newTabs = tabs.length >= 5 ? tabs.slice(1) : tabs;
    set({
      tabs: [...newTabs, { ...tab, id, createdAt: new Date().toISOString() }],
    });
    return id;
  },
  updateTab: (id, updates) =>
    set({
      tabs: get().tabs.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }),
  removeTab: (id) => set({ tabs: get().tabs.filter((t) => t.id !== id) }),
  setActiveTab: (id) => {
    set((state) => {
      const tab = state.tabs.find((t) => t.id === id);
      if (!tab) return state;
      const otherTabs = state.tabs.filter((t) => t.id !== id);
      return { tabs: [...otherTabs, tab] };
    });
  },
}));
