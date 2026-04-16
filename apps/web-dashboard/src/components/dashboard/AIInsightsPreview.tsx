'use client'

import Link from 'next/link'
import { Zap, TrendingUp, TrendingDown, Calendar } from 'lucide-react'

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

export default function AIInsightsPreview({ insights }: AIInsightsPreviewProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BREAKOUT': return 'bg-success/20 text-success border-success/30'
      case 'MOMENTUM': return 'bg-accent-blue/20 text-accent-blue border-accent-blue/30'
      case 'DECLINE': return 'bg-accent-red/20 text-accent-red border-accent-red/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BREAKOUT': return Zap
      case 'MOMENTUM': return TrendingUp
      case 'DECLINE': return TrendingDown
      default: return Zap
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'HOLD': return 'text-accent-blue'
      case 'SELL': return 'text-accent-red'
      case 'BUY': return 'text-success'
      default: return 'text-text-secondary'
    }
  }

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-xl">AI Insights</h3>
        <div className="flex items-center gap-2">
          <div className="text-text-muted text-sm">Last updated: 2 hours ago</div>
          <Link 
            href="/ai-insights"
            className="text-accent-blue hover:text-blue-400 text-sm font-medium transition-colors duration-200"
          >
            See All →
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => {
          const TypeIcon = getTypeIcon(insight.type)
          
          return (
            <div 
              key={insight.id}
              className={`border rounded-xl p-4 transition-all duration-200 hover:shadow-lg ${
                insight.type === 'BREAKOUT' 
                  ? 'bg-success/5 border-success/30' 
                  : insight.type === 'DECLINE'
                  ? 'bg-accent-red/5 border-accent-red/30'
                  : 'bg-accent-blue/5 border-accent-blue/30'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-bold border ${getTypeColor(insight.type)}`}>
                    <TypeIcon className="w-3 h-3 inline mr-1" />
                    {insight.type}
                  </div>
                  <div className="text-text-secondary text-xs">
                    {insight.sport}
                  </div>
                </div>
                {insight.affected_cards > 0 && (
                  <div className="bg-success/10 text-success px-2 py-1 rounded-full text-xs font-medium">
                    {insight.affected_cards} in inventory
                  </div>
                )}
              </div>

              {/* Content */}
              <h4 className="text-white font-semibold mb-2">{insight.headline}</h4>
              
              <div className="flex items-center gap-4 text-sm text-text-secondary mb-3">
                <span className="flex items-center gap-1">
                  {insight.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-success" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-accent-red" />
                  )}
                  {insight.price_change}
                </span>
                <span>{insight.price_range}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {insight.published}
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${getRecommendationColor(insight.recommendation)}`}>
                  Recommendation: {insight.recommendation}
                </span>
                <Link 
                  href={`/ai-insights/${insight.id}`}
                  className="text-accent-blue hover:text-blue-400 text-sm font-medium transition-colors duration-200"
                >
                  View Details →
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Alert Settings */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="text-text-secondary text-sm">
            Price movement alerts enabled
          </div>
          <button className="text-accent-blue hover:text-blue-400 text-sm font-medium transition-colors duration-200">
            Configure →
          </button>
        </div>
      </div>
    </div>
  )
}
