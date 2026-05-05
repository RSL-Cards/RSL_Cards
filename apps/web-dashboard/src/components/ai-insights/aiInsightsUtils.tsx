import { TrendingDown, TrendingUp, Zap } from 'lucide-react'

export const typeStyles = {
  BREAKOUT: {
    icon: Zap,
    label: 'Breakout',
    card: 'border-success/30 bg-success/5',
    chip: 'border-success/30 bg-success/15 text-success',
  },
  MOMENTUM: {
    icon: TrendingUp,
    label: 'Momentum',
    card: 'border-accent-blue/30 bg-accent-blue/5',
    chip: 'border-accent-blue/30 bg-accent-blue/15 text-accent-blue',
  },
  DECLINE: {
    icon: TrendingDown,
    label: 'Decline',
    card: 'border-accent-red/30 bg-accent-red/5',
    chip: 'border-accent-red/30 bg-accent-red/15 text-accent-red',
  },
}

export const recommendationStyles: Record<string, string> = {
  HOLD: 'bg-accent-blue/15 text-accent-blue border-accent-blue/30',
  SELL: 'bg-accent-red/15 text-accent-red border-accent-red/30',
  BUY: 'bg-success/15 text-success border-success/30',
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
  if (grade.includes('PSA')) return 'chip-warning'
  if (grade.includes('BGS')) return 'chip-blue'
  return 'bg-gray-500/20 px-2 py-1 rounded-full text-xs font-medium text-gray-400'
}
