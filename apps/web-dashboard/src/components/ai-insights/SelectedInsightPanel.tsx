import { Eye } from 'lucide-react'
import { formatCurrency, formatGrade } from '@/components/inventory/inventoryUtils'
import { AIInsight, InventoryCard } from './aiInsightsTypes'
import {
  getGradeColor,
  insightConfidence,
  insightUrgency,
  recommendationStyles,
} from './aiInsightsUtils'

interface SelectedInsightPanelProps {
  affectedInventory: InventoryCard[]
  selectedInsight: AIInsight | undefined
}

export default function SelectedInsightPanel({
  affectedInventory,
  selectedInsight,
}: SelectedInsightPanelProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
        <h2 className="text-xl font-bold text-white">Selected Insight</h2>
        {!selectedInsight ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[#252525] rounded-xl bg-[#141414] mt-4">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#0D0D0D] text-zinc-500 border border-[#252525]">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No insight selected</h3>
            <p className="mt-1 max-w-sm text-xs text-zinc-400">
              Select an RSL signal from the feed on the left to view detailed analysis and recommendations.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {selectedInsight.player}
              </div>
              <div className="mt-2 text-sm leading-6 text-zinc-300">
                {selectedInsight.body}
              </div>
            </div>

            <div className="rounded-xl border border-[#252525] bg-[#141414] p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Recommendation</span>
                <span className={`rounded-full border px-2 py-1 text-xs font-bold ${recommendationStyles[selectedInsight.recommendation] ?? 'border-[#252525] text-zinc-400'}`}>
                  {selectedInsight.recommendation}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-zinc-400">Confidence</span>
                <span className="font-mono text-white">{insightConfidence[selectedInsight.id] ?? 80}%</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-zinc-400">Urgency</span>
                <span className="text-white">{insightUrgency[selectedInsight.id] ?? 'Monitor'}</span>
              </div>
            </div>

            <button type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#252525] bg-[#141414] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1A1A1A] w-full">
              <Eye className="h-4 w-4 text-zinc-400" />
              Review Affected Inventory
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
        <h2 className="text-xl font-bold text-white">Affected Inventory</h2>
        <div className="mt-4 space-y-3">
          {affectedInventory.map((card) => (
            <div key={card.id} className="rounded-lg border border-[#252525] bg-[#141414] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">{card.player_name}</div>
                  <div className="mt-1 text-xs text-zinc-400">
                    {card.year} {card.set_name}
                  </div>
                </div>
                <span className={getGradeColor(card.grade_key)}>
                  {formatGrade(card.grade_key)}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-zinc-500">Value</div>
                  <div className="mt-1 font-mono text-white">{formatCurrency(card.market_value)}</div>
                </div>
                <div>
                  <div className="text-zinc-500">P/L</div>
                  <div className={`mt-1 font-mono ${card.unrealized_gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {card.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(card.unrealized_gain)}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500">Held</div>
                  <div className="mt-1 font-mono text-white">{card.days_held}d</div>
                </div>
              </div>
            </div>
          ))}

          {affectedInventory.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-[#252525] rounded-xl bg-[#141414]">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#0D0D0D] border border-[#252525] text-zinc-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xs font-semibold text-white">No affected inventory</h3>
              <p className="mt-1 max-w-xs text-xs text-zinc-400">
                You currently do not own any active inventory cards matching this player or signal.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
