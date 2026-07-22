import { AlertTriangle } from 'lucide-react'
import { formatCurrency } from './inventoryUtils'

interface InventoryMetricsProps {
  totalCards: number
  listedCards: number
  unlistedCards: number
}

export default function InventoryMetrics({
  totalCards,
  listedCards,
  unlistedCards,
}: InventoryMetricsProps) {
  const coverage = totalCards > 0 ? Math.round((listedCards / totalCards) * 100) : 0

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="metric-card bg-[#0D0D0D] border border-[#252525] rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-400">Total Inventory</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{totalCards}</div>
        <div className="mt-1 text-sm text-zinc-400">Cards in your collection</div>
      </div>
      <div className="metric-card bg-[#0D0D0D] border border-[#252525] rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-400">Listed</div>
        <div className="mt-2 font-mono text-3xl font-bold text-blue-400">{listedCards}</div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#141414] border border-[#252525]">
          <div className="h-full rounded-full bg-blue-500" style={{ width: `${coverage}%` }} />
        </div>
        <div className="mt-2 text-sm text-zinc-400">Live on marketplaces</div>
      </div>
      <div className="metric-card bg-[#0D0D0D] border border-[#252525] rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-400">Unlisted</div>
        <div className="mt-2 font-mono text-3xl font-bold text-amber-400">{unlistedCards}</div>
        <div className="mt-1 text-sm text-zinc-400">Ready to be listed</div>
      </div>
    </div>
  )
}
