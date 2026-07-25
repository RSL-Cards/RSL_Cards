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
  const panelClass = 'rounded-2xl border border-[#252525] bg-[#0D0D0D] p-5 shadow-sm'
  const actionClass =
    'flex w-full items-center justify-between rounded-xl border border-[#252525] bg-[#141414] px-4 py-3 text-left transition-colors duration-200 hover:border-[#333] hover:bg-[#1A1A1A]'

  return (
    <div className="space-y-6">
      <div className={panelClass}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Import Tools</h2>
          <FileSpreadsheet className="h-5 w-5 text-blue-400" />
        </div>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => onOpenImportTool('upload')}
            className={actionClass}
          >
            <span>
              <span className="block font-semibold text-white">CSV/Excel Import</span>
              <span className="text-sm text-zinc-400">Upload sheets and preview rows</span>
            </span>
            <Upload className="h-4 w-4 text-zinc-400" />
          </button>
          <button
            type="button"
            onClick={() => onOpenImportTool('mapping')}
            className={actionClass}
          >
            <span>
              <span className="block font-semibold text-white">RSL Column Mapping</span>
              <span className="text-sm text-zinc-400">Map card, grade, cost, and platform</span>
            </span>
            <Sparkles className="h-4 w-4 text-amber-400" />
          </button>
          <button
            type="button"
            onClick={() => onOpenImportTool('rapid')}
            className={actionClass}
          >
            <span>
              <span className="block font-semibold text-white">Rapid Add</span>
              <span className="text-sm text-zinc-400">Quick entry for show buys</span>
            </span>
            <Plus className="h-4 w-4 text-emerald-400" />
          </button>
        </div>
      </div>

      <div className={panelClass}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Aging Alerts</h2>
          <AlertTriangle className="h-5 w-5 text-amber-400" />
        </div>
        <div className="space-y-3">
          {agingCards.length > 0 ? (
            agingCards.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => onCardDetail(card)}
                className="w-full rounded-xl border border-[#252525] bg-[#141414] p-3 text-left transition-colors duration-200 hover:border-red-500/50 hover:bg-[#1A1A1A]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{card.player_name}</div>
                    <div className="text-sm text-zinc-400">{formatGrade(card.grade_key)} - {card.set_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold text-red-400">{card.days_held}d</div>
                    <div className="text-xs text-zinc-500">held</div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-xl border border-[#252525] bg-[#141414] p-4 text-sm text-zinc-400">
              No aging alerts match the current filters.
            </div>
          )}
        </div>
      </div>

      <div className={panelClass}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Daily Auto-Revaluation</h2>
          <RefreshCw className="h-5 w-5 text-emerald-400" />
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-2 font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Enabled
            </div>
            <p className="mt-2 text-sm text-zinc-300">
              Market comps refresh daily at 6:00 AM and update unrealized P/L.
            </p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Next run</span>
            <span className="font-mono text-white">Tomorrow 6:00 AM</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Comp sources</span>
            <span className="text-zinc-300">{platformOptions.slice(0, 4).join(', ')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
