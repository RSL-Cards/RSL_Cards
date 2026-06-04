export interface InventoryCard {
  id: string
  image_url: string
  player_name: string
  year: number | null
  set_name: string
  grade_key: string
  sport: string
  cost_basis: number
  market_value: number
  unrealized_gain: number
  unrealized_gain_pct: number
  status: string
  days_held: number
  comp_avg: number
  comp_trend: number
  platforms_listed: string[]
  quantity?: number
  card_number?: string | null
  variation?: string | null
  cert_number?: string | null
  notes?: string | null
  added_at?: string | null
}

export interface InventorySummary {
  total_cards: number
  total_cost_basis: number
  total_market_value: number
  total_unrealized_gain: number
}

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

export const toDisplaySport = (sport: string | null | undefined) => {
  if (!sport) return 'Unspecified'
  return sport
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

export const calculateDaysHeld = (date: string | null | undefined) => {
  if (!date) return 0
  const addedAt = new Date(date).getTime()

  if (Number.isNaN(addedAt)) return 0

  return Math.max(0, Math.floor((Date.now() - addedAt) / 86_400_000))
}

export const cardImageStyle = (card: InventoryCard) => {
  const palette: Record<string, string> = {
    Football: 'from-blue-600/80 via-cyan-500/30 to-white/10',
    Baseball: 'from-red-600/80 via-amber-500/30 to-white/10',
    Basketball: 'from-orange-500/80 via-purple-500/30 to-white/10',
  }

  return palette[card.sport] ?? 'from-slate-600/80 via-zinc-500/30 to-white/10'
}
