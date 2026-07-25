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
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'

      case 'MOMENTUM':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30'

      case 'DECLINE':
        return 'bg-red-500/15 text-red-400 border-red-500/30'

      default:
        return 'bg-[#141414] text-zinc-300 border-[#252525]'
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
        return 'text-emerald-400'

      case 'SELL':
        return 'text-red-400'

      case 'HOLD':
        return 'text-blue-400'

      default:
        return 'text-zinc-400'
    }
  }

  return (
    <div className="dashboard-card bg-[#0D0D0D] border border-[#252525] rounded-2xl p-6 shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-bold text-2xl tracking-tight">
            RSL Insights
          </h3>
          <p className="mt-0.5 text-xs text-zinc-400">
            Smart market intelligence powered by RSL
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-zinc-400 text-sm">
            Last updated: 2 hours ago
          </div>

          <Link
            href="/ai-insights"
            className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors duration-200"
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
              className={`border rounded-2xl p-5 transition-all duration-300 ${
                insight.type === 'BREAKOUT'
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : insight.type === 'DECLINE'
                  ? 'bg-red-500/10 border-red-500/20'
                  : 'bg-blue-500/10 border-blue-500/20'
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

                  <div className="text-zinc-400 text-sm">
                    {insight.sport}
                  </div>
                </div>

                {insight.affected_cards > 0 && (
                  <div className="bg-[#141414] border border-[#252525] px-3 py-1.5 rounded-full text-xs font-medium text-zinc-300 shadow-sm">
                    {insight.affected_cards} in inventory
                  </div>
                )}
              </div>

              {/* Headline */}
              <h4 className="text-white font-semibold text-lg leading-snug mb-4">
                {insight.headline}
              </h4>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-5 text-sm text-zinc-400 mb-5">

                <span className="flex items-center gap-1.5">
                  {insight.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}

                  <span className="font-medium">
                    {insight.price_change}
                  </span>
                </span>

                <span className="font-medium">
                  {insight.price_range}
                </span>

                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-zinc-400" />

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
                  className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors duration-200"
                >
                  View Details →
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-5 border-t border-[#252525]">
        <div className="flex items-center justify-between">

          <div className="text-zinc-400 text-sm">
            Price movement alerts enabled
          </div>

          <button className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors duration-200">
            Configure →
          </button>
        </div>
      </div>
    </div>
  )
}