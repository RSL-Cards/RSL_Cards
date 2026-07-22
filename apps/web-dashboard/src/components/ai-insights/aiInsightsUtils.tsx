import { TrendingDown, TrendingUp, Zap } from 'lucide-react'

export const typeStyles = {
  BREAKOUT: {
    icon: Zap,
    label: 'Breakout',
    card: 'border-emerald-500/30 bg-emerald-500/10',
    chip: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400',
  },
  MOMENTUM: {
    icon: TrendingUp,
    label: 'Momentum',
    card: 'border-blue-500/30 bg-blue-500/10',
    chip: 'border-blue-500/30 bg-blue-500/15 text-blue-400',
  },
  DECLINE: {
    icon: TrendingDown,
    label: 'Decline',
    card: 'border-red-500/30 bg-red-500/10',
    chip: 'border-red-500/30 bg-red-500/15 text-red-400',
  },
}

export const recommendationStyles: Record<string, string> = {
  HOLD: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  SELL: 'bg-red-500/15 text-red-400 border border-red-500/30',
  BUY: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
}

export const insightConfidence: Record<string, number> = {
  'ai-001': 94,
  'ai-002': 87,
  'ai-003': 91,
}

export const insightUrgency: Record<string, string> = {
  'ai-001': 'Review today',
  'ai-002': 'Monitor comps',
  'ai-003': 'List aging card',
}

export const getNumericChange = (value: string) =>
  Number(value.replace('%', '').replace('+', ''))

export const getSportColor = (sport: string) => {
  switch (sport.toLowerCase()) {
    case 'football':
      return 'bg-blue-500/20 text-blue-400'
    case 'baseball':
      return 'bg-red-500/20 text-red-400'
    case 'basketball':
      return 'bg-orange-500/20 text-orange-400'
    default:
      return 'bg-zinc-800 text-zinc-400'
  }
}

export const getGradeColor = (grade: string) => {
  if (grade.includes('PSA')) return 'inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-400'
  if (grade.includes('BGS')) return 'inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-400'
  return 'bg-zinc-800 border border-[#252525] px-2 py-1 rounded-full text-xs font-medium text-zinc-400'
}
