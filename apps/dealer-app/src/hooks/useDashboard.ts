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
  net_profit: string;
}

export interface TodayActivity {
  id: string;
  type: "buy" | "sell" | "trade";
  price: string;
  profit: string | null;
  playerName: string;
  imageUrl?: string | null;
  time: string;
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

export interface ReportData {
  period: string;
  cards_bought: number;
  cards_sold: number;
  total_spent: string;
  total_revenue: string;
  net_profit: string;
  avg_margin: number;
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

export function useReport(period: "week" | "month") {
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

export function useProfitByChannel(period: "week" | "month") {
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
    }, [queryClient, userId]),
  );
}
