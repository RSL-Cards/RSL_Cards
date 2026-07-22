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
    <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm xl:col-span-2">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Signal Feed</h2>
          <p className="mt-1 text-sm text-zinc-400">
            {insights.length} insights match your filters.
          </p>
        </div>
        <div className="text-xs text-zinc-500">Last updated 2 hours ago</div>
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
              className={`w-full rounded-xl border p-4 text-left transition-colors bg-[#141414] border-[#252525] hover:border-[#E8001C]/50 ${
                isSelected ? 'ring-1 ring-[#E8001C] border-[#E8001C]' : ''
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
                    <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${recommendationStyles[insight.recommendation] ?? 'border-[#252525] text-zinc-400'}`}>
                      {insight.recommendation}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{insight.headline}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                    {insight.body}
                  </p>
                </div>
                <div className="min-w-36 text-left md:text-right">
                  <div className={`font-mono text-2xl font-bold ${insight.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {insight.price_change}
                  </div>
                  <div className="mt-1 text-sm text-zinc-400">{insight.price_range}</div>
                  <div className="mt-2 text-xs text-zinc-500">{insight.published}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 border-t border-[#252525] pt-4 md:grid-cols-3">
                <div>
                  <div className="text-xs text-zinc-500">Confidence</div>
                  <div className="mt-1 font-mono text-sm font-semibold text-white">
                    {insightConfidence[insight.id] ?? 80}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Affected Cards</div>
                  <div className="mt-1 font-mono text-sm font-semibold text-white">
                    {insight.affected_cards}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Urgency</div>
                  <div className="mt-1 font-mono text-sm font-semibold text-white">
                    {insightUrgency[insight.id] ?? 'Normal'}
                  </div>
                </div>
              </div>
            </button>
          )
        })}

        {insights.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#252525] bg-[#141414] py-16 text-center my-4">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E8001C]/15 text-[#E8001C]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white">No signals generated yet</h3>
            <p className="mt-1 max-w-sm text-xs text-zinc-400">
              We couldn&apos;t find any active RSL market narratives or signals matching your current filter criteria. Try broadening your sport or confidence filters!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
