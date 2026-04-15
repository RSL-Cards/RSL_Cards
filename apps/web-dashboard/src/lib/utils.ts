import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatPercent(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
}

export function formatCompactNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

export function getGradeDisplay(grade: string): string {
  return grade.replace('_', ' ')
}

export function getGradeColor(grade: string): string {
  if (grade.includes('PSA')) return 'text-yellow-500'
  if (grade.includes('BGS')) return 'text-blue-500'
  return 'text-gray-400'
}

export function getTrendColor(trend: number): string {
  if (trend > 0) return 'text-success'
  if (trend < 0) return 'text-accent-red'
  return 'text-text-secondary'
}

export function getTrendIcon(trend: number): string {
  if (trend > 0) return '↑'
  if (trend < 0) return '↓'
  return '→'
}
