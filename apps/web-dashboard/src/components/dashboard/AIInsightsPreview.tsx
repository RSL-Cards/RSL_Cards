'use client'

import Link from 'next/link'
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Calendar
} from 'lucide-react'

interface AIInsight {
  id: string
  type: 'BREAKOUT' | 'MOMENTUM' | 'DECLINE'
  player: string
  sport: string
  headline: string
  price_change: string
  price_range: string
  published: string
  affected_cards: number
  trend: 'up' | 'down'
  recommendation: string
}

interface AIInsightsPreviewProps {
  insights: AIInsight[]
}

export default function AIInsightsPreview({
  insights
}: AIInsightsPreviewProps) {

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BREAKOUT':
        return 'bg-green-50 text-green-700 border-green-200'

      case 'MOMENTUM':
        return 'bg-blue-50 text-blue-700 border-blue-200'

      case 'DECLINE':
        return 'bg-red-50 text-red-700 border-red-200'

      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BREAKOUT':
        return Zap

      case 'MOMENTUM':
        return TrendingUp

      case 'DECLINE':
        return TrendingDown

      default:
        return Zap
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY':
        return 'text-green-600'

      case 'SELL':
        return 'text-red-600'

      case 'HOLD':
        return 'text-blue-600'

      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="dashboard-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-gray-900 font-bold text-2xl tracking-tight">
            RSL Insights
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Smart market intelligence powered by RSL
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-gray-400 text-sm">
            Last updated: 2 hours ago
          </div>

          <Link
            href="/ai-insights"
            className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors duration-200"
          >
            See All →
          </Link>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-4">
        {insights.map((insight) => {
          const TypeIcon = getTypeIcon(insight.type)

          return (
            <div
              key={insight.id}
              className={`border rounded-2xl p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                insight.type === 'BREAKOUT'
                  ? 'bg-green-50/60 border-green-100'
                  : insight.type === 'DECLINE'
                  ? 'bg-red-50/60 border-red-100'
                  : 'bg-blue-50/60 border-blue-100'
              }`}
            >

              {/* Top */}
              <div className="flex items-start justify-between mb-4">

                <div className="flex items-center gap-3">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${getTypeColor(insight.type)}`}
                  >
                    <TypeIcon className="w-3 h-3" />

                    {insight.type}
                  </div>

                  <div className="text-gray-500 text-sm">
                    {insight.sport}
                  </div>
                </div>

                {insight.affected_cards > 0 && (
                  <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                    {insight.affected_cards} in inventory
                  </div>
                )}
              </div>

              {/* Headline */}
              <h4 className="text-gray-900 font-semibold text-lg leading-snug mb-4">
                {insight.headline}
              </h4>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500 mb-5">

                <span className="flex items-center gap-1.5">
                  {insight.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}

                  <span className="font-medium">
                    {insight.price_change}
                  </span>
                </span>

                <span className="font-medium">
                  {insight.price_range}
                </span>

                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />

                  {insight.published}
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">

                <div
                  className={`text-sm font-semibold ${getRecommendationColor(
                    insight.recommendation
                  )}`}
                >
                  Recommendation: {insight.recommendation}
                </div>

                <Link
                  href={`/ai-insights/${insight.id}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors duration-200"
                >
                  View Details →
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-5 border-t border-gray-100">
        <div className="flex items-center justify-between">

          <div className="text-gray-500 text-sm">
            Price movement alerts enabled
          </div>

          <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors duration-200">
            Configure →
          </button>
        </div>
      </div>
    </div>
  )
}