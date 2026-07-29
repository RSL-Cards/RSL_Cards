import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { apiClient } from "../lib/apiClient";
import { ENDPOINTS } from "../config/api";
import { useAuthStore } from "../stores/authStore";

export interface DailyStats {
  cards_bought: number;
  cards_sold: number;
  total_spent: string;
  total_revenue: string;
  cost_of_cards_sold: string;
  net_profit: string;
  expenses: string;
  avg_margin: number;
  current_inventory_cost_basis: string;
}

export interface TodayActivity {
  id: string;
  type: "buy" | "sell" | "trade" | "expense";
  price: string;
  profit: string | null;
  playerName: string;
  imageUrl?: string | null;
  time: string;
  channel?: string | null;
  paymentMethod?: string | null;
}

export function useDailyStats() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery<DailyStats>({
    queryKey: ["analytics", "daily", userId],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.analytics.daily);
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useTodayActivity() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery<TodayActivity[]>({
    queryKey: ["analytics", "today-activity", userId],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.analytics.todayActivity);
      return data ?? [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export interface ActiveDailyLog {
  id: string;
  name: string;
  status: string;
  startingCash: string;
  stats?: {
    moneyIn: string;
    moneyOut: string;
    profit: string;
    cardsBought: number;
    cardsSold: number;
  } | null;
}

export function useActiveDailyLog() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery<ActiveDailyLog | null>({
    queryKey: ["daily-logs", "active", userId],
    queryFn: async () => {
      const { data } = await apiClient.get("/v1/daily-logs/active");
      return data;
    },
    enabled: !!userId,
  });
}

export interface ReportData {
  period: string;
  cards_bought: number;
  cards_sold: number;
  total_spent: string;
  total_revenue: string;
  cost_of_cards_sold: string;
  net_profit: string;
  expenses: string;
  avg_margin: number;
  current_inventory_cost_basis: string;
  daily_revenue: { day: string; revenue: number }[];
  best_deal: { player: string; profit: string; margin: number } | null;
}

export interface ChannelData {
  period: string;
  channels: {
    channel: string;
    revenue: number;
    profit: number;
    sales: number;
  }[];
}

export function useReport(period: "week" | "month" | "ytd") {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery<ReportData>({
    queryKey: ["analytics", "report", period, userId],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.analytics.report(period));
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useProfitByChannel(period: "week" | "month" | "ytd") {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery<ChannelData>({
    queryKey: ["analytics", "channel", period, userId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        ENDPOINTS.analytics.profitChannel(period),
      );
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useRefetchDashboardOnFocus() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      // Only refetch if cached data is older than 2 minutes
      const refetchIfStale = (queryKey: unknown[]) => {
        const state = queryClient.getQueryState(queryKey);
        const age = Date.now() - (state?.dataUpdatedAt ?? 0);
        if (age > 1000 * 60 * 2) {
          queryClient.invalidateQueries({ queryKey });
        }
      };
      refetchIfStale(["analytics", "daily", userId]);
      refetchIfStale(["analytics", "today-activity", userId]);
      refetchIfStale(["ai-insights", userId]);
    }, [queryClient, userId]),
  );
}

export interface AIInsight {
  id: string;
  type: "BREAKOUT" | "MOMENTUM" | "DECLINE";
  player: string;
  sport: string;
  headline: string;
  body: string;
  price_change: string;
  price_range: string;
  published: string;
  affected_cards: number;
  trend: "up" | "down";
  recommendation: string;
}

export function useAiInsights() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery<AIInsight[]>({
    queryKey: ["ai-insights", userId],
    queryFn: async () => {
      const { data } = await apiClient.get("/v1/web-dashboard/ai-insights");
      return data ?? [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export interface DailyLogStats {
  cardsBought: number;
  cardsSold: number;
  trades: number;
  revenue: string;
  purchases: string;
  costOfCardsSold: string;
  expenses: string;
  profit: string;
  profitMargin: string;
  expectedEndingCash: string;
}

export interface DailyLog {
  id: string;
  userId: string;
  name: string;
  status: "open" | "closed";
  startingCash: string;
  updatedAfterClosing: boolean;
  createdAt: string;
  closedAt: string | null;
  stats: DailyLogStats;
}

export function useDailyLogs() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery<DailyLog[]>({
    queryKey: ["daily-logs", "list", userId],
    queryFn: async () => {
      const { data } = await apiClient.get("/v1/daily-logs");
      return data ?? [];
    },
    enabled: !!userId,
  });
}

export function useDailyLogTransactions(logId: string | null) {
  return useQuery<any[]>({
    queryKey: ["daily-logs", "transactions", logId],
    queryFn: async () => {
      if (!logId) return [];
      const { data } = await apiClient.get(`/v1/daily-logs/${logId}/transactions`);
      return data ?? [];
    },
    enabled: !!logId,
  });
}
