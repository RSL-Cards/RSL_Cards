export interface InventoryCard {
  id: string
  image_url: string
  player_name: string
  year: number | null
  set_name: string
  grade_key: string
  grade_company?: string | null
  grade_value?: string | null
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
  lowest_active?: number
  highest_active?: number
  lowest_sold?: number
  highest_sold?: number
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

export const GRADE_CONFIG: Record<string, { badgeStyle: string; label: string }> = {
  PSA_10: { badgeStyle: 'bg-amber-400 text-black border-amber-300 font-extrabold shadow-sm', label: 'PSA 10' },
  PSA_9:  { badgeStyle: 'bg-zinc-800 text-amber-400 border-amber-500/50 font-bold', label: 'PSA 9' },
  PSA_8:  { badgeStyle: 'bg-zinc-800 text-amber-300/80 border-zinc-700 font-medium', label: 'PSA 8' },
  BGS_10: { badgeStyle: 'bg-gradient-to-r from-amber-300 to-yellow-500 text-black border-amber-300 font-extrabold shadow-sm', label: 'BGS 10' },
  BGS_95: { badgeStyle: 'bg-blue-600 text-white border-blue-400 font-bold shadow-sm', label: 'BGS 9.5' },
  BGS_9:  { badgeStyle: 'bg-blue-950/80 text-blue-300 border-blue-700/80 font-medium', label: 'BGS 9' },
  SGC_10: { badgeStyle: 'bg-zinc-950 text-white border-zinc-500 font-extrabold shadow-sm', label: 'SGC 10' },
  SGC_95: { badgeStyle: 'bg-zinc-900 text-zinc-200 border-zinc-600 font-bold', label: 'SGC 9.5' },
  SGC_9:  { badgeStyle: 'bg-zinc-900 text-zinc-300 border-zinc-700 font-medium', label: 'SGC 9' },
  CGC_10: { badgeStyle: 'bg-cyan-500 text-black border-cyan-300 font-extrabold shadow-sm', label: 'CGC 10' },
  CGC_95: { badgeStyle: 'bg-cyan-700 text-white border-cyan-500 font-bold', label: 'CGC 9.5' },
  RAW:    { badgeStyle: 'bg-[#141414] text-zinc-400 border-[#252525] font-medium', label: 'RAW' },
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

export const formatGrade = (gradeKey: string | null | undefined) => {
  if (!gradeKey) return 'RAW'
  if (GRADE_CONFIG[gradeKey]) return GRADE_CONFIG[gradeKey].label
  return gradeKey.replace(/_/g, ' ')
}

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
