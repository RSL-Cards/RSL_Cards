'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

interface MetricCardProps {
  title: string
  value: string | number
  trend?: {
    value: number
    label?: string
  }
  subtitle?: string
  sparklineData?: number[]
  format?: 'currency' | 'number' | 'percentage'
  color?: 'blue' | 'green' | 'red' | 'default'
}

export default function MetricCard({
  title,
  value,
  trend,
  subtitle,
  sparklineData,
  format = 'currency',
  color = 'default'
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(val)
      case 'percentage':
        return `${val}%`
      default:
        return val.toLocaleString()
    }
  }

  const getTrendIcon = (trendValue: number) => {
    if (trendValue > 0) return TrendingUp
    if (trendValue < 0) return TrendingDown
    return Minus
  }

  const getTrendColor = (trendValue: number) => {
    if (trendValue > 0) return 'text-emerald-400'
    if (trendValue < 0) return 'text-red-400'
    return 'text-zinc-500'
  }

  const getChartColor = () => {
    switch (color) {
      case 'blue': return '#0057FF'
      case 'green': return '#10B981'
      case 'red': return '#E8001C'
      default: return '#E8001C'
    }
  }

  const chartData = sparklineData?.map((value, index) => ({
    index,
    value
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="metric-card border border-[#252525] rounded-2xl p-6 shadow-sm hover:border-[#383838] transition-all duration-300 bg-gradient-to-b from-[#121212] to-[#0D0D0D]"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-zinc-400 text-sm font-medium mb-1">{title}</h3>
          <div className="text-white font-mono text-3xl font-bold">
            {formatValue(value)}
          </div>
          {subtitle && (
            <div className="text-zinc-500 text-sm mt-1">{subtitle}</div>
          )}
        </div>

        {trend && (() => {
          const TrendIcon = getTrendIcon(trend.value)

          return (
            <div className={`flex items-center gap-1 ${getTrendColor(trend.value)}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
            </div>
          )
        })()}
      </div>

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 1 && (
        <div className="h-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getChartColor()} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={getChartColor()} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={getChartColor()}
                strokeWidth={1.5}
                fill={`url(#gradient-${color})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  )
}
