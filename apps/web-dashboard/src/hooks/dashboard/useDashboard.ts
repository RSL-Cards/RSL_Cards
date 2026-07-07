import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  metrics: () => [...dashboardKeys.all, 'metrics'] as const,
  revenueChart: () => [...dashboardKeys.all, 'revenueChart'] as const,
  channelData: () => [...dashboardKeys.all, 'channelData'] as const,
  inventory: (page: number, limit: number, search?: string) => [...dashboardKeys.all, 'inventory', page, limit, search] as const,
  inventoryCounts: () => [...dashboardKeys.all, 'inventoryCounts'] as const,
  inventoryItemDetails: (id: string) => [...dashboardKeys.all, 'inventoryItemDetails', id] as const,
  topMovers: () => [...dashboardKeys.all, 'topMovers'] as const,
  recentTransactions: () => [...dashboardKeys.all, 'recentTransactions'] as const,
  aiInsights: () => [...dashboardKeys.all, 'aiInsights'] as const,
  portfolioSnapshot: () => [...dashboardKeys.all, 'portfolioSnapshot'] as const,
  transactionsPassbook: () => [...dashboardKeys.all, 'transactionsPassbook'] as const,
  affectedInventory: (playerName: string) => [...dashboardKeys.all, 'affectedInventory', playerName] as const,
  compHistory: (insightId: string) => [...dashboardKeys.all, 'compHistory', insightId] as const,
  sportProfitMix: () => [...dashboardKeys.all, 'sportProfitMix'] as const,
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

export function useDashboardInventory(page: number = 1, limit: number = 20, search?: string) {
  return useQuery({
    queryKey: dashboardKeys.inventory(page, limit, search),
    queryFn: () => dashboardService.getInventory(page, limit, search),
  });
}

export function useDashboardInventoryCounts() {
  return useQuery({
    queryKey: dashboardKeys.inventoryCounts(),
    queryFn: dashboardService.getInventoryCounts,
  });
}

export function useDashboardInventoryItemDetails(id: string | null) {
  return useQuery({
    queryKey: dashboardKeys.inventoryItemDetails(id as string),
    queryFn: () => dashboardService.getInventoryItemDetails(id as string),
    enabled: !!id,
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

export function useDashboardPassbook() {
  return useQuery({
    queryKey: dashboardKeys.transactionsPassbook(),
    queryFn: dashboardService.getPassbookTransactions,
  });
}

export function useAffectedInventory(playerName: string) {
  return useQuery({
    queryKey: dashboardKeys.affectedInventory(playerName),
    queryFn: () => dashboardService.getAffectedInventory(playerName),
    enabled: !!playerName,
  });
}

export function useCompHistory(insightId: string) {
  return useQuery({
    queryKey: dashboardKeys.compHistory(insightId),
    queryFn: () => dashboardService.getCompHistory(insightId),
    enabled: !!insightId,
  });
}

export function useSportProfitMix() {
  return useQuery({
    queryKey: dashboardKeys.sportProfitMix(),
    queryFn: dashboardService.getSportProfitMix,
  });
}
