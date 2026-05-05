import { AI_INSIGHTS, INVENTORY_TABLE_DATA, TOP_MOVERS } from '@/data/mockDashboard'

export type AIInsight = (typeof AI_INSIGHTS)[number]
export type InventoryCard = (typeof INVENTORY_TABLE_DATA)[number]
export type TopMover = (typeof TOP_MOVERS)[number]

export type InsightType = 'all' | 'BREAKOUT' | 'MOMENTUM' | 'DECLINE'
export type RecommendationFilter = 'all' | 'HOLD' | 'SELL' | 'BUY'

export type InsightMetrics = {
  activeAlerts: number
  highConfidence: number
  inventoryAtRisk: number
  upsideValue: number
}

export type InsightAction = {
  id: string
  player: string
  action: string
  priority: 'High' | 'Medium' | 'Low'
  due: string
}
