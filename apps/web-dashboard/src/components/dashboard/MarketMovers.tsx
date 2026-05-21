'use client'

import {
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'

import {
  AreaChart,
  Area,
  ResponsiveContainer
} from 'recharts'

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

export default function MarketMovers({
  movers
}: MarketMoversProps) {

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return TrendingUp

      case 'down':
        return TrendingDown

      default:
        return Minus
    }
  }

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'

    return 'text-gray-500'
  }

  const getGradeColor = (grade: string) => {
    if (grade.includes('PSA')) {
      return 'bg-amber-50 text-amber-700 border border-amber-100'
    }

    if (grade.includes('BGS')) {
      return 'bg-blue-50 text-blue-700 border border-blue-100'
    }

    return 'bg-gray-100 text-gray-600 border border-gray-200'
  }

  const getSportColor = (sport: string) => {
    switch (sport.toLowerCase()) {

      case 'football':
        return 'bg-blue-50 text-blue-700 border border-blue-100'

      case 'baseball':
        return 'bg-red-50 text-red-700 border border-red-100'

      case 'basketball':
        return 'bg-orange-50 text-orange-700 border border-orange-100'

      default:
        return 'bg-gray-100 text-gray-600 border border-gray-200'
    }
  }

  // Sparkline generator
  const generateSparklineData = (
    trend: string,
    baseValue: number
  ) => {

    const points = 7
    const data = []

    let currentValue = baseValue

    for (let i = 0; i < points; i++) {

      data.push(currentValue)

      if (trend === 'up') {
        currentValue +=
          (Math.random() * 2 - 0.5) + 1
      }

      else if (trend === 'down') {
        currentValue +=
          (Math.random() * 2 - 1.5)
      }

      else {
        currentValue +=
          (Math.random() * 2 - 1)
      }
    }

    return data.map((value, index) => ({
      index,
      value
    }))
  }

  return (
    <div className="dashboard-card bg-white border border-gray-200 rounded-3xl p-7 shadow-sm hover:shadow-md transition-all duration-300">

      {/* Header */}
      <div className="mb-7">

        <h3 className="text-gray-900 font-bold text-2xl tracking-tight">
          Market Movers
        </h3>

        <div className="text-gray-500 text-sm mt-1">
          Biggest card price movements today
        </div>
      </div>

      {/* Movers */}
      <div className="space-y-4">

        {movers.map((mover, index) => {

          const TrendIcon = getTrendIcon(mover.trend)

          const sparklineData =
            generateSparklineData(
              mover.trend,
              mover.price
            )

          const chartColor =
            mover.change > 0
              ? '#22C55E'
              : '#EF4444'

          return (
            <div
              key={index}
              className={`
                rounded-2xl
                border
                p-4
                transition-all
                duration-300
                hover:shadow-sm
                hover:-translate-y-0.5
                ${
                  mover.change > 0
                    ? 'bg-green-50/70 border-green-100'
                    : 'bg-red-50/70 border-red-100'
                }
              `}
            >

              <div className="flex items-center justify-between gap-4">

                {/* Left */}
                <div className="flex items-center gap-4 flex-1 min-w-0">

                  {/* Sparkline */}
                  <div className="w-20 h-10 flex-shrink-0">

                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparklineData}>

                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={chartColor}
                          strokeWidth={2}
                          fill={chartColor}
                          fillOpacity={0.08}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Player */}
                  <div className="flex-1 min-w-0">

                    <div className="text-gray-900 font-semibold truncate">
                      {mover.player}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">

                      <div
                        className={`
                          text-xs
                          px-2.5
                          py-1
                          rounded-full
                          font-medium
                          ${getGradeColor(mover.grade)}
                        `}
                      >
                        {mover.grade}
                      </div>

                      <div
                        className={`
                          text-xs
                          px-2.5
                          py-1
                          rounded-full
                          font-medium
                          ${getSportColor(mover.sport)}
                        `}
                      >
                        {mover.sport}
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="text-gray-500 text-sm mt-2 line-clamp-1">
                      {mover.reason}
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="text-right flex-shrink-0">

                  <div className="text-gray-900 font-mono font-bold text-lg">
                    ${mover.price}
                  </div>

                  <div
                    className={`
                      flex
                      items-center
                      justify-end
                      gap-1
                      mt-1
                      text-sm
                      font-semibold
                      ${getTrendColor(mover.change)}
                    `}
                  >

                    <TrendIcon className="w-4 h-4" />

                    {mover.change > 0 ? '+' : ''}
                    {mover.change}%
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-5 border-t border-gray-100">

        <div className="flex items-center justify-between">

          <div className="text-gray-500 text-sm">
            Prices based on last 30 eBay sold listings
          </div>

          <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors duration-200">
            View Market Trends →
          </button>
        </div>
      </div>
    </div>
  )
}