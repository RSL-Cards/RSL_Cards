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
  getInventory() {
    return dashboardRequest<any[]>(ENDPOINTS.webDashboard.inventory)
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
}
