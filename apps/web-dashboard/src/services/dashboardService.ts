import { ENDPOINTS } from '@/config/api'
import { apiClient } from '@/lib/axios'

async function dashboardRequest<TResponse>(path: string) {
  const response = await apiClient.get<TResponse>(path)
  return response.data
}

export const dashboardService = {
  getMetrics() {
    return dashboardRequest<any>(ENDPOINTS.webDashboard.metrics)
  },
  getRevenueChart() {
    return dashboardRequest<any[]>(ENDPOINTS.webDashboard.revenueChart)
  },
  getChannelData() {
    return dashboardRequest<any[]>(ENDPOINTS.webDashboard.channelData)
  },
  getInventory(page: number = 1, limit: number = 20, search?: string) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) params.append('search', search)
    return dashboardRequest<any>(`${ENDPOINTS.webDashboard.inventory}?${params.toString()}`)
  },
  getInventoryCounts() {
    return dashboardRequest<any>(ENDPOINTS.webDashboard.inventoryCounts)
  },
  getInventoryItemDetails(id: string) {
    return dashboardRequest<any>(ENDPOINTS.webDashboard.inventoryItemDetails(id))
  },
  getTopMovers() {
    return dashboardRequest<any[]>(ENDPOINTS.webDashboard.topMovers)
  },
  getRecentTransactions() {
    return dashboardRequest<any[]>(ENDPOINTS.webDashboard.recentTransactions)
  },
  getAiInsights() {
    return dashboardRequest<any[]>(ENDPOINTS.webDashboard.aiInsights)
  },
  getPortfolioSnapshot() {
    return dashboardRequest<any>(ENDPOINTS.webDashboard.portfolioSnapshot)
  },
  getPassbookTransactions() {
    return dashboardRequest<any[]>(ENDPOINTS.webDashboard.transactionsPassbook)
  },
}
