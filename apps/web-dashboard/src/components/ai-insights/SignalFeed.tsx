import { AIInsight } from './aiInsightsTypes'
import {
  getSportColor,
  insightConfidence,
  insightUrgency,
  recommendationStyles,
  typeStyles,
} from './aiInsightsUtils'

interface SignalFeedProps {
  insights: AIInsight[]
  selectedInsightId: string
  onSelectInsight: (insightId: string) => void
}

export default function SignalFeed({
  insights,
  selectedInsightId,
  onSelectInsight,
}: SignalFeedProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Signal Feed</h2>
          <p className="mt-1 text-sm text-gray-500">
            {insights.length} insights match your filters.
          </p>
        </div>
        <div className="text-xs text-gray-400">Last updated 2 hours ago</div>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => {
          const typeKey = (insight.type || 'MOMENTUM').toUpperCase()
          const styles = typeStyles[typeKey as keyof typeof typeStyles] || typeStyles.MOMENTUM
          const TypeIcon = styles.icon
          const isSelected = selectedInsightId === insight.id

          return (
            <button
              key={insight.id}
              type="button"
              onClick={() => onSelectInsight(insight.id)}
              className={`w-full rounded-xl border p-4 text-left transition-colors hover:border-white/30 ${styles.card} ${
                isSelected ? 'ring-1 ring-accent-blue' : ''
              }`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-bold ${styles.chip}`}>
                      <TypeIcon className="h-3 w-3" />
                      {styles.label}
                    </span>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getSportColor(insight.sport)}`}>
                      {insight.sport}
                    </span>
                    <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${recommendationStyles[insight.recommendation] ?? 'border-gray-200 text-gray-500'}`}>
                      {insight.recommendation}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{insight.headline}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
                    {insight.body}
                  </p>
                </div>
                <div className="min-w-36 text-left md:text-right">
                  <div className={`font-mono text-2xl font-bold ${insight.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {insight.price_change}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">{insight.price_range}</div>
                  <div className="mt-2 text-xs text-gray-400">{insight.published}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 border-t border-gray-200 pt-4 md:grid-cols-3">
                <div>
                  <div className="text-xs text-gray-400">Confidence</div>
                  <div className="mt-1 font-mono text-sm font-semibold text-gray-900">
                    {insightConfidence[insight.id] ?? 80}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Affected Cards</div>
                  <div className="mt-1 font-mono text-sm font-semibold text-gray-900">
                    {insight.affected_cards}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Next Action</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">
                    {insightUrgency[insight.id] ?? 'Monitor'}
                  </div>
                </div>
              </div>
            </button>
          )
        })}

        {insights.length === 0 && (
          <div className="rounded-xl border border-gray-200 py-12 text-center text-sm text-gray-500">
            No AI insights match the selected filters.
          </div>
        )}
      </div>
    </div>
  )
}
