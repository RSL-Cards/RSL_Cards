import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  metrics: (from?: string, to?: string) => [...dashboardKeys.all, 'metrics', from, to] as const,
  revenueChart: (from?: string, to?: string) => [...dashboardKeys.all, 'revenueChart', from, to] as const,
  channelData: (from?: string, to?: string) => [...dashboardKeys.all, 'channelData', from, to] as const,
  inventory: (page: number, limit: number, search?: string) => [...dashboardKeys.all, 'inventory', page, limit, search] as const,
  inventoryCounts: () => [...dashboardKeys.all, 'inventoryCounts'] as const,
  inventoryItemDetails: (id: string) => [...dashboardKeys.all, 'inventoryItemDetails', id] as const,
  topMovers: () => [...dashboardKeys.all, 'topMovers'] as const,
  recentTransactions: (from?: string, to?: string) => [...dashboardKeys.all, 'recentTransactions', from, to] as const,
  aiInsights: () => [...dashboardKeys.all, 'aiInsights'] as const,
  portfolioSnapshot: () => [...dashboardKeys.all, 'portfolioSnapshot'] as const,
  transactionsPassbook: () => [...dashboardKeys.all, 'transactionsPassbook'] as const,
  affectedInventory: (playerName: string) => [...dashboardKeys.all, 'affectedInventory', playerName] as const,
  compHistory: (insightId: string) => [...dashboardKeys.all, 'compHistory', insightId] as const,
  sportProfitMix: () => [...dashboardKeys.all, 'sportProfitMix'] as const,
};

export function useDashboardMetrics(from?: string, to?: string) {
  return useQuery({
    queryKey: dashboardKeys.metrics(from, to),
    queryFn: () => dashboardService.getMetrics(from, to),
  });
}

export function useRevenueChart(from?: string, to?: string) {
  return useQuery({
    queryKey: dashboardKeys.revenueChart(from, to),
    queryFn: () => dashboardService.getRevenueChart(from, to),
  });
}

export function useChannelData(from?: string, to?: string) {
  return useQuery({
    queryKey: dashboardKeys.channelData(from, to),
    queryFn: () => dashboardService.getChannelData(from, to),
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

export function useRecentTransactions(from?: string, to?: string) {
  return useQuery({
    queryKey: dashboardKeys.recentTransactions(from, to),
    queryFn: () => dashboardService.getRecentTransactions(from, to),
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
