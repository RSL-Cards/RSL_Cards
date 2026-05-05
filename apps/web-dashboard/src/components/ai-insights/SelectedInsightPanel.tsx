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
      <div className="dashboard-card">
        <h2 className="text-xl font-bold text-white">Selected Insight</h2>
        {selectedInsight && (
          <div className="mt-4 space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {selectedInsight.player}
              </div>
              <div className="mt-2 text-sm leading-6 text-text-secondary">
                {selectedInsight.body}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Recommendation</span>
                <span className={`rounded-full border px-2 py-1 text-xs font-bold ${recommendationStyles[selectedInsight.recommendation] ?? 'border-border text-text-secondary'}`}>
                  {selectedInsight.recommendation}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-text-secondary">Confidence</span>
                <span className="font-mono text-white">{insightConfidence[selectedInsight.id] ?? 80}%</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-text-secondary">Urgency</span>
                <span className="text-white">{insightUrgency[selectedInsight.id] ?? 'Monitor'}</span>
              </div>
            </div>

            <button type="button" className="btn-outline inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold">
              <Eye className="h-4 w-4" />
              Review Affected Inventory
            </button>
          </div>
        )}
      </div>

      <div className="dashboard-card">
        <h2 className="text-xl font-bold text-white">Affected Inventory</h2>
        <div className="mt-4 space-y-3">
          {affectedInventory.map((card) => (
            <div key={card.id} className="rounded-lg border border-border bg-surface-2 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">{card.player_name}</div>
                  <div className="mt-1 text-xs text-text-muted">
                    {card.year} {card.set_name}
                  </div>
                </div>
                <span className={getGradeColor(card.grade_key)}>
                  {formatGrade(card.grade_key)}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-text-muted">Value</div>
                  <div className="mt-1 font-mono text-white">{formatCurrency(card.market_value)}</div>
                </div>
                <div>
                  <div className="text-text-muted">P/L</div>
                  <div className={`mt-1 font-mono ${card.unrealized_gain >= 0 ? 'text-success' : 'text-accent-red'}`}>
                    {card.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(card.unrealized_gain)}
                  </div>
                </div>
                <div>
                  <div className="text-text-muted">Held</div>
                  <div className="mt-1 font-mono text-white">{card.days_held}d</div>
                </div>
              </div>
            </div>
          ))}

          {affectedInventory.length === 0 && (
            <div className="rounded-lg border border-border py-8 text-center text-sm text-text-secondary">
              No matching inventory card found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
