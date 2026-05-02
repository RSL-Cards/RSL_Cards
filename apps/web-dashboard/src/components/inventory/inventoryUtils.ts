import { INVENTORY_TABLE_DATA } from '@/data/mockDashboard'

export type InventoryCard = (typeof INVENTORY_TABLE_DATA)[number]

export type SortKey =
  | 'player_name'
  | 'grade_key'
  | 'sport'
  | 'year'
  | 'set_name'
  | 'cost_basis'
  | 'market_value'
  | 'unrealized_gain'
  | 'days_held'
  | 'platforms_listed'
  | 'status'

export type SortDirection = 'asc' | 'desc'
export type ProfitFilter = 'all' | 'profit' | 'loss'
export type ImportToolMode = 'upload' | 'mapping' | 'rapid'

export const sortLabels: Record<SortKey, string> = {
  player_name: 'Card Name',
  grade_key: 'Grade',
  sport: 'Sport',
  year: 'Year',
  set_name: 'Set',
  cost_basis: 'Cost Basis',
  market_value: 'Market Value',
  unrealized_gain: 'Profit/Loss',
  days_held: 'Days Held',
  platforms_listed: 'Listed On',
  status: 'Status',
}

export const platformOptions = ['eBay', 'Whatnot', 'TCGPlayer', 'Shopify', 'COMC', 'Mercari']

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

export const formatGrade = (grade: string) => grade.replace('_', ' ')

export const cardImageStyle = (card: InventoryCard) => {
  const palette: Record<string, string> = {
    Football: 'from-blue-600/80 via-cyan-500/30 to-white/10',
    Baseball: 'from-red-600/80 via-amber-500/30 to-white/10',
    Basketball: 'from-orange-500/80 via-purple-500/30 to-white/10',
  }

  return palette[card.sport] ?? 'from-slate-600/80 via-zinc-500/30 to-white/10'
}
