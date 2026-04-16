'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

interface MarketMoversProps {
  movers: Array<{
    player: string
    change: number
    price: number
    grade: string
    sport: string
    trend: 'up' | 'down'
    reason: string
  }>
}

export default function MarketMovers({ movers }: MarketMoversProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp
      case 'down': return TrendingDown
      default: return Minus
    }
  }

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-success'
    if (change < 0) return 'text-accent-red'
    return 'text-text-secondary'
  }

  const getGradeColor = (grade: string) => {
    if (grade.includes('PSA')) return 'chip-warning'
    if (grade.includes('BGS')) return 'chip-blue'
    return 'bg-gray-500/20 text-gray-400'
  }

  const getSportColor = (sport: string) => {
    switch (sport.toLowerCase()) {
      case 'football': return 'bg-blue-500/20 text-blue-400'
      case 'baseball': return 'bg-red-500/20 text-red-400'
      case 'basketball': return 'bg-orange-500/20 text-orange-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  // Generate sparkline data for each mover
  const generateSparklineData = (trend: string, baseValue: number) => {
    const points = 7
    const data = []
    let currentValue = baseValue

    for (let i = 0; i < points; i++) {
      data.push(currentValue)
      
      if (trend === 'up') {
        currentValue += (Math.random() * 2 - 0.5) + 1
      } else if (trend === 'down') {
        currentValue += (Math.random() * 2 - 1.5)
      } else {
        currentValue += (Math.random() * 2 - 1)
      }
    }

    return data.map((value, index) => ({ index, value }))
  }

  return (
    <div className="dashboard-card">
      <h3 className="text-white font-bold text-xl mb-6">Market Movers Today</h3>
      
      <div className="space-y-3">
        {movers.map((mover, index) => {
          const TrendIcon = getTrendIcon(mover.trend)
          const sparklineData = generateSparklineData(mover.trend, mover.price)
          const chartColor = mover.change > 0 ? '#00C853' : '#E8001C'

          return (
            <div 
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${
                mover.change > 0 
                  ? 'bg-success/5 border-l-2 border-success' 
                  : 'bg-accent-red/5 border-l-2 border-accent-red'
              }`}
            >
              {/* Player Info */}
              <div className="flex items-center gap-3 flex-1">
                {/* Sparkline */}
                <div className="w-16 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparklineData}>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={chartColor}
                        strokeWidth={1.5}
                        fill={chartColor}
                        fillOpacity={0.1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex-1">
                  <div className="text-white font-medium">{mover.player}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`text-xs px-2 py-0.5 rounded-full ${getGradeColor(mover.grade)}`}>
                      {mover.grade}
                    </div>
                    <div className={`text-xs px-2 py-0.5 rounded-full ${getSportColor(mover.sport)}`}>
                      {mover.sport}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Change */}
              <div className="text-right">
                <div className="text-white font-mono font-bold">${mover.price}</div>
                <div className={`flex items-center justify-end gap-1 text-sm font-medium ${getTrendColor(mover.change)}`}>
                  <TrendIcon className="w-3 h-3" />
                  {mover.change > 0 ? '+' : ''}{mover.change}%
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="text-text-secondary text-xs">
          Prices based on last 30 eBay sold listings
        </div>
      </div>
    </div>
  )
}
