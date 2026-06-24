import { TrendingDown, TrendingUp } from 'lucide-react'
import { formatCurrency, formatGrade } from '@/components/inventory/inventoryUtils'
import { TopMover } from './aiInsightsTypes'
import { getGradeColor, getNumericChange, getSportColor } from './aiInsightsUtils'

interface MoverWatchlistProps {
  matchedMovers: TopMover[]
  movers: TopMover[]
}

export default function MoverWatchlist({ matchedMovers, movers }: MoverWatchlistProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">Mover Watchlist</h2>
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
                {isMatched && (
                  <span className="rounded-full bg-blue-600/15 px-2 py-1 text-xs font-semibold text-blue-600">
                    Linked insight
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
