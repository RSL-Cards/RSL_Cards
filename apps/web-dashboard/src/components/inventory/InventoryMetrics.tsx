import { AlertTriangle } from 'lucide-react'
import { formatCurrency } from './inventoryUtils'

interface InventoryMetricsProps {
  totalCards: number
  listedCards: number
  unlistedCards: number
  totalCostBasis?: number
  currentMarketValue?: number
  unrealizedGain?: number
}

export default function InventoryMetrics({
  totalCards,
  listedCards,
  unlistedCards,
  totalCostBasis = 0,
  currentMarketValue = 0,
  unrealizedGain = 0,
}: InventoryMetricsProps) {
  const gainPct = totalCostBasis > 0 ? ((unrealizedGain / totalCostBasis) * 100).toFixed(1) : '0'

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <div className="metric-card bg-[#0D0D0D] border border-[#252525] rounded-2xl p-5 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Cards</div>
        <div className="mt-2 font-mono text-2xl font-bold text-white">{totalCards}</div>
        <div className="mt-1 text-xs text-zinc-500">In collection</div>
      </div>
      <div className="metric-card bg-[#0D0D0D] border border-[#252525] rounded-2xl p-5 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Cost Basis</div>
        <div className="mt-2 font-mono text-2xl font-bold text-white">{formatCurrency(totalCostBasis)}</div>
        <div className="mt-1 text-xs text-zinc-500">Purchase cost</div>
      </div>
      <div className="metric-card bg-[#0D0D0D] border border-[#252525] rounded-2xl p-5 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Market Value</div>
        <div className="mt-2 font-mono text-2xl font-bold text-white">{formatCurrency(currentMarketValue)}</div>
        <div className="mt-1 text-xs text-zinc-500">Live comps</div>
      </div>
      <div className="metric-card bg-[#0D0D0D] border border-[#252525] rounded-2xl p-5 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Listed / Unlisted</div>
        <div className="mt-2 font-mono text-2xl font-bold text-blue-400">
          {listedCards} <span className="text-sm font-semibold text-zinc-500">/ {unlistedCards}</span>
        </div>
        <div className="mt-1 text-xs text-zinc-500">{totalCards > 0 ? `${Math.round((listedCards / totalCards) * 100)}% listed` : '0% listed'}</div>
      </div>
      <div className="metric-card bg-[#0D0D0D] border border-[#252525] rounded-2xl p-5 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Unrealized P/L</div>
        <div className={`mt-2 font-mono text-2xl font-bold ${unrealizedGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {unrealizedGain >= 0 ? '+' : ''}{formatCurrency(unrealizedGain)}
        </div>
        <div className="mt-1 text-xs text-zinc-500">{unrealizedGain >= 0 ? '+' : ''}{gainPct}% return</div>
      </div>
    </div>
  )
}
