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
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Selected Insight</h2>
        {selectedInsight && (
          <div className="mt-4 space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {selectedInsight.player}
              </div>
              <div className="mt-2 text-sm leading-6 text-gray-500">
                {selectedInsight.body}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Recommendation</span>
                <span className={`rounded-full border px-2 py-1 text-xs font-bold ${recommendationStyles[selectedInsight.recommendation] ?? 'border-gray-200 text-gray-500'}`}>
                  {selectedInsight.recommendation}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-500">Confidence</span>
                <span className="font-mono text-gray-900">{insightConfidence[selectedInsight.id] ?? 80}%</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-500">Urgency</span>
                <span className="text-gray-900">{insightUrgency[selectedInsight.id] ?? 'Monitor'}</span>
              </div>
            </div>

            <button type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold">
              <Eye className="h-4 w-4" />
              Review Affected Inventory
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Affected Inventory</h2>
        <div className="mt-4 space-y-3">
          {affectedInventory.map((card) => (
            <div key={card.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">{card.player_name}</div>
                  <div className="mt-1 text-xs text-gray-400">
                    {card.year} {card.set_name}
                  </div>
                </div>
                <span className={getGradeColor(card.grade_key)}>
                  {formatGrade(card.grade_key)}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-gray-400">Value</div>
                  <div className="mt-1 font-mono text-gray-900">{formatCurrency(card.market_value)}</div>
                </div>
                <div>
                  <div className="text-gray-400">P/L</div>
                  <div className={`mt-1 font-mono ${card.unrealized_gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {card.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(card.unrealized_gain)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Held</div>
                  <div className="mt-1 font-mono text-gray-900">{card.days_held}d</div>
                </div>
              </div>
            </div>
          ))}

          {affectedInventory.length === 0 && (
            <div className="rounded-lg border border-gray-200 py-8 text-center text-sm text-gray-500">
              No matching inventory card found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
