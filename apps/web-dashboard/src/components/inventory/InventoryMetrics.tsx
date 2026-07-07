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
      <div className="metric-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Total Inventory</div>
        <div className="mt-2 font-mono text-3xl font-bold text-gray-900">{totalCards}</div>
        <div className="mt-1 text-sm text-gray-400">Cards in your collection</div>
      </div>
      <div className="metric-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Listed</div>
        <div className="mt-2 font-mono text-3xl font-bold text-blue-600">{listedCards}</div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-blue-600" style={{ width: `${coverage}%` }} />
        </div>
        <div className="mt-2 text-sm text-gray-400">Live on marketplaces</div>
      </div>
      <div className="metric-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Unlisted</div>
        <div className="mt-2 font-mono text-3xl font-bold text-amber-600">{unlistedCards}</div>
        <div className="mt-1 text-sm text-gray-400">Ready to be listed</div>
      </div>
    </div>
  )
}
