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
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useTodayActivity() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery<TodayActivity[]>({
    queryKey: ["analytics", "today-activity", userId],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.analytics.todayActivity);
      return data.items ?? [];
    },
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useRefetchDashboardOnFocus() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: ["analytics", "daily", userId] });
      queryClient.invalidateQueries({ queryKey: ["analytics", "today-activity", userId] });
    }, [queryClient, userId]),
  );
}
