import { InventoryCard } from '@/components/inventory/inventoryUtils'

export type ReportPeriod = 'Daily' | 'Weekly' | 'Monthly' | 'Custom'
export type MarginDimension = 'sport' | 'year' | 'grade' | 'platform'

export interface DateRange {
  from: string
  to: string
}

export interface NormalizedRevenuePoint {
  date: string
  isoDate: string
  revenue: number
  profit: number
}

export interface PlatformSales {
  platform: string
  revenue: number
  profit: number
  color: string
}

export interface MarginReportItem {
  name: string
  cards: number
  profit: number
  value: number
  margin: number
}

export interface AgingReportItem extends MarginReportItem {
  avgDays: number
}

export type OldestCard = InventoryCard
