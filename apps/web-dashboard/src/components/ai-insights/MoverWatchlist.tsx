import { TrendingDown, TrendingUp } from 'lucide-react'
import { formatCurrency, formatGrade } from '@/components/inventory/inventoryUtils'
import { TopMover } from './aiInsightsTypes'
import { getGradeColor, getNumericChange, getSportColor } from './aiInsightsUtils'

interface ExtendedTopMover extends TopMover {
  inInventory?: boolean
}

interface MoverWatchlistProps {
  matchedMovers: ExtendedTopMover[]
  movers: ExtendedTopMover[]
}

export default function MoverWatchlist({ matchedMovers, movers }: MoverWatchlistProps) {
  return (
    <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
      <h2 className="text-xl font-bold text-white">Top Market Movers</h2>
      <div className="mt-4 space-y-3">
        {movers.map((mover) => {
          const isMatched = matchedMovers.some((matched) => matched.player === mover.player)
          const change = getNumericChange(`${mover.change}%`)

          return (
            <div
              key={mover.player}
              className={`rounded-lg border p-3 ${
                isMatched ? 'border-[#E8001C]/30 bg-[#E8001C]/10' : 'border-[#252525] bg-[#141414]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">{mover.player}</div>
                  <div className="mt-1 text-xs text-zinc-400">{mover.reason}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-white">{formatCurrency(mover.price)}</div>
                  <div className={`mt-1 flex items-center justify-end gap-1 text-sm font-semibold ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {mover.trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    {mover.change > 0 ? '+' : ''}{mover.change}%
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={getGradeColor(mover.grade)}>{formatGrade(mover.grade)}</span>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getSportColor(mover.sport)}`}>
                  {mover.sport}
                </span>
                {mover.inInventory && (
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                    In Inventory
                  </span>
                )}
                {isMatched && (
                  <span className="rounded-full bg-[#E8001C]/15 border border-[#E8001C]/30 px-2 py-1 text-xs font-semibold text-[#E8001C]">
                    Linked insight
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {movers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[#252525] rounded-xl bg-[#141414]">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E8001C]/15 text-[#E8001C]">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No market movers tracked</h3>
            <p className="mt-1 max-w-xs text-xs text-zinc-400">
              We haven&apos;t detected any significant 30-day price shifts (&ge; 15%) across active sports card markets yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
