import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Sparkles,
  Upload,
} from 'lucide-react'
import { formatGrade, ImportToolMode, InventoryCard, platformOptions } from './inventoryUtils'

interface InventorySidePanelProps {
  agingCards: InventoryCard[]
  onCardDetail: (card: InventoryCard) => void
  onOpenImportTool: (mode: ImportToolMode) => void
}

export default function InventorySidePanel({
  agingCards,
  onCardDetail,
  onOpenImportTool,
}: InventorySidePanelProps) {
  return (
    <div className="space-y-6">
      <div className="dashboard-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Import Tools</h2>
          <FileSpreadsheet className="h-5 w-5 text-accent-blue" />
        </div>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => onOpenImportTool('upload')}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-white/5 px-4 py-3 text-left transition-colors duration-200 hover:border-accent-blue"
          >
            <span>
              <span className="block font-semibold text-white">CSV/Excel Import</span>
              <span className="text-sm text-text-secondary">Upload sheets and preview rows</span>
            </span>
            <Upload className="h-4 w-4 text-text-muted" />
          </button>
          <button
            type="button"
            onClick={() => onOpenImportTool('mapping')}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-white/5 px-4 py-3 text-left transition-colors duration-200 hover:border-accent-blue"
          >
            <span>
              <span className="block font-semibold text-white">AI Column Mapping</span>
              <span className="text-sm text-text-secondary">Map card, grade, cost, and platform</span>
            </span>
            <Sparkles className="h-4 w-4 text-warning" />
          </button>
          <button
            type="button"
            onClick={() => onOpenImportTool('rapid')}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-white/5 px-4 py-3 text-left transition-colors duration-200 hover:border-accent-blue"
          >
            <span>
              <span className="block font-semibold text-white">Rapid Add</span>
              <span className="text-sm text-text-secondary">Quick entry for show buys</span>
            </span>
            <Plus className="h-4 w-4 text-success" />
          </button>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Aging Alerts</h2>
          <AlertTriangle className="h-5 w-5 text-warning" />
        </div>
        <div className="space-y-3">
          {agingCards.length > 0 ? (
            agingCards.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => onCardDetail(card)}
                className="w-full rounded-lg border border-border bg-white/5 p-3 text-left transition-colors duration-200 hover:border-accent-red"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{card.player_name}</div>
                    <div className="text-sm text-text-secondary">{formatGrade(card.grade_key)} - {card.set_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-accent-red">{card.days_held}d</div>
                    <div className="text-xs text-text-muted">held</div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-lg border border-border bg-white/5 p-4 text-sm text-text-secondary">
              No aging alerts match the current filters.
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Daily Auto-Revaluation</h2>
          <RefreshCw className="h-5 w-5 text-success" />
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border border-success/20 bg-success/10 p-4">
            <div className="flex items-center gap-2 font-semibold text-success">
              <CheckCircle2 className="h-4 w-4" />
              Enabled
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              Market comps refresh daily at 6:00 AM and update unrealized P/L.
            </p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Next run</span>
            <span className="font-mono text-white">Tomorrow 6:00 AM</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Comp sources</span>
            <span className="text-white">{platformOptions.slice(0, 4).join(', ')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
