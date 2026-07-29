import { ENDPOINTS } from '@/config/api'
import { apiClient } from '@/lib/axios'

async function dashboardRequest<TResponse>(path: string) {
  const response = await apiClient.get<TResponse>(path)
  return response.data
}

export const dashboardService = {
  getMetrics(from?: string, to?: string) {
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    const qs = params.toString() ? `?${params.toString()}` : ''
    return dashboardRequest<any>(`${ENDPOINTS.webDashboard.metrics}${qs}`)
  },
  getRevenueChart(from?: string, to?: string) {
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    const qs = params.toString() ? `?${params.toString()}` : ''
    return dashboardRequest<any[]>(`${ENDPOINTS.webDashboard.revenueChart}${qs}`)
  },
  getChannelData(from?: string, to?: string) {
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    const qs = params.toString() ? `?${params.toString()}` : ''
    return dashboardRequest<any[]>(`${ENDPOINTS.webDashboard.channelData}${qs}`)
  },
  getInventory(page: number = 1, limit: number = 20, search?: string, status?: string) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) params.append('search', search)
    if (status) params.append('status', status)
    return dashboardRequest<any>(`${ENDPOINTS.webDashboard.inventory}?${params.toString()}`)
  },
  exportInventory() {
    return dashboardRequest<any[]>(ENDPOINTS.webDashboard.inventoryExport)
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
  getRecentTransactions(from?: string, to?: string) {
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    const qs = params.toString() ? `?${params.toString()}` : ''
    return dashboardRequest<any[]>(`${ENDPOINTS.webDashboard.recentTransactions}${qs}`)
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
  getAffectedInventory(playerName: string) {
    return dashboardRequest<any[]>(ENDPOINTS.webDashboard.affectedInventory(playerName))
  },
  getCompHistory(insightId: string) {
    return dashboardRequest<any[]>(ENDPOINTS.webDashboard.compHistory(insightId))
  },
  getSportProfitMix() {
    return dashboardRequest<any[]>(ENDPOINTS.webDashboard.sportProfitMix)
  },
}
