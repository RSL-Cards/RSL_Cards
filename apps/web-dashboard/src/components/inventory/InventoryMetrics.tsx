import { AlertTriangle } from 'lucide-react'
import { formatCurrency } from './inventoryUtils'

interface InventoryMetricsProps {
  agingCount: number
  filteredCount: number
  filteredGain: number
  filteredValue: number
  listedCount: number
  totalPortfolioValue: number
}

export default function InventoryMetrics({
  agingCount,
  filteredCount,
  filteredGain,
  filteredValue,
  listedCount,
  totalPortfolioValue,
}: InventoryMetricsProps) {
  const coverage = filteredCount > 0 ? Math.round((listedCount / filteredCount) * 100) : 0

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <div className="metric-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Filtered Value</div>
        <div className="mt-2 font-mono text-3xl font-bold text-gray-900">{formatCurrency(filteredValue)}</div>
        <div className="mt-1 text-sm text-gray-400">{filteredCount} cards visible</div>
      </div>
      <div className="metric-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Unrealized P/L</div>
        <div className={`mt-2 font-mono text-3xl font-bold ${filteredGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {filteredGain >= 0 ? '+' : ''}{formatCurrency(filteredGain)}
        </div>
        <div className="mt-1 text-sm text-gray-400">
          Total portfolio {formatCurrency(totalPortfolioValue)}
        </div>
      </div>
      <div className="metric-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Listed Coverage</div>
        <div className="mt-2 font-mono text-3xl font-bold text-gray-900">{listedCount}/{filteredCount}</div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-blue-600" style={{ width: `${coverage}%` }} />
        </div>
        <div className="mt-2 text-sm text-gray-400">Cards live on marketplaces</div>
      </div>
      <div className="metric-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Aging Alerts
        </div>
        <div className="mt-2 font-mono text-3xl font-bold text-gray-900">{agingCount}</div>
        <div className="mt-1 text-sm text-gray-400">Held over 60 days</div>
      </div>
    </div>
  )
}
