import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  metrics: () => [...dashboardKeys.all, 'metrics'] as const,
  revenueChart: () => [...dashboardKeys.all, 'revenueChart'] as const,
  channelData: () => [...dashboardKeys.all, 'channelData'] as const,
  inventory: () => [...dashboardKeys.all, 'inventory'] as const,
  topMovers: () => [...dashboardKeys.all, 'topMovers'] as const,
  recentTransactions: () => [...dashboardKeys.all, 'recentTransactions'] as const,
  aiInsights: () => [...dashboardKeys.all, 'aiInsights'] as const,
  portfolioSnapshot: () => [...dashboardKeys.all, 'portfolioSnapshot'] as const,
};

export function useDashboardMetrics() {
  return useQuery({
    queryKey: dashboardKeys.metrics(),
    queryFn: dashboardService.getMetrics,
  });
}

export function useRevenueChart() {
  return useQuery({
    queryKey: dashboardKeys.revenueChart(),
    queryFn: dashboardService.getRevenueChart,
  });
}

export function useChannelData() {
  return useQuery({
    queryKey: dashboardKeys.channelData(),
    queryFn: dashboardService.getChannelData,
  });
}

export function useDashboardInventory() {
  return useQuery({
    queryKey: dashboardKeys.inventory(),
    queryFn: dashboardService.getInventory,
  });
}

export function useTopMovers() {
  return useQuery({
    queryKey: dashboardKeys.topMovers(),
    queryFn: dashboardService.getTopMovers,
  });
}

export function useRecentTransactions() {
  return useQuery({
    queryKey: dashboardKeys.recentTransactions(),
    queryFn: dashboardService.getRecentTransactions,
  });
}

export function useAiInsights() {
  return useQuery({
    queryKey: dashboardKeys.aiInsights(),
    queryFn: dashboardService.getAiInsights,
  });
}

export function usePortfolioSnapshot() {
  return useQuery({
    queryKey: dashboardKeys.portfolioSnapshot(),
    queryFn: dashboardService.getPortfolioSnapshot,
  });
}
