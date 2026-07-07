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
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">Top Market Movers</h2>
      <div className="mt-4 space-y-3">
        {movers.map((mover) => {
          const isMatched = matchedMovers.some((matched) => matched.player === mover.player)
          const change = getNumericChange(`${mover.change}%`)

          return (
            <div
              key={mover.player}
              className={`rounded-lg border p-3 ${
                isMatched ? 'border-blue-200 bg-blue-600/5' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">{mover.player}</div>
                  <div className="mt-1 text-xs text-gray-400">{mover.reason}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-gray-900">{formatCurrency(mover.price)}</div>
                  <div className={`mt-1 flex items-center justify-end gap-1 text-sm font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    In Inventory
                  </span>
                )}
                {isMatched && (
                  <span className="rounded-full bg-blue-600/15 px-2 py-1 text-xs font-semibold text-blue-600">
                    Linked insight
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {movers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/60">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">No market movers tracked</h3>
            <p className="mt-1 max-w-xs text-xs text-gray-500">
              We haven&apos;t detected any significant 30-day price shifts (&ge; 15%) across active sports card markets yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
