import { TrendingDown, TrendingUp, Zap } from 'lucide-react'

export const typeStyles = {
  BREAKOUT: {
    icon: Zap,
    label: 'Breakout',
    card: 'border-success/30 bg-green-600/5',
    chip: 'border-success/30 bg-green-600/15 text-green-600',
  },
  MOMENTUM: {
    icon: TrendingUp,
    label: 'Momentum',
    card: 'border-blue-200 bg-blue-600/5',
    chip: 'border-blue-200 bg-blue-600/15 text-blue-600',
  },
  DECLINE: {
    icon: TrendingDown,
    label: 'Decline',
    card: 'border-accent-red/30 bg-red-600/5',
    chip: 'border-accent-red/30 bg-red-600/15 text-red-600',
  },
}

export const recommendationStyles: Record<string, string> = {
  HOLD: 'bg-blue-600/15 text-blue-600 border-blue-200',
  SELL: 'bg-red-600/15 text-red-600 border-accent-red/30',
  BUY: 'bg-green-600/15 text-green-600 border-success/30',
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
      return 'bg-gray-500/20 text-gray-400'
  }
}

export const getGradeColor = (grade: string) => {
  if (grade.includes('PSA')) return 'inline-flex items-center gap-1 rounded-full border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-xs font-semibold text-yellow-700'
  if (grade.includes('BGS')) return 'inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700'
  return 'bg-gray-500/20 px-2 py-1 rounded-full text-xs font-medium text-gray-400'
}
