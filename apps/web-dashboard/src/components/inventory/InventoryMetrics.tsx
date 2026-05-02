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
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <div className="metric-card">
        <div className="text-sm font-medium text-text-secondary">Filtered Value</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{formatCurrency(filteredValue)}</div>
        <div className="mt-1 text-sm text-text-muted">{filteredCount} cards visible</div>
      </div>
      <div className="metric-card">
        <div className="text-sm font-medium text-text-secondary">Unrealized P/L</div>
        <div className={`mt-2 font-mono text-3xl font-bold ${filteredGain >= 0 ? 'text-success' : 'text-accent-red'}`}>
          {filteredGain >= 0 ? '+' : ''}{formatCurrency(filteredGain)}
        </div>
        <div className="mt-1 text-sm text-text-muted">
          Total portfolio {formatCurrency(totalPortfolioValue)}
        </div>
      </div>
      <div className="metric-card">
        <div className="text-sm font-medium text-text-secondary">Listed Coverage</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{listedCount}/{filteredCount}</div>
        <div className="mt-1 text-sm text-text-muted">Cards live on marketplaces</div>
      </div>
      <div className="metric-card">
        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <AlertTriangle className="h-4 w-4 text-warning" />
          Aging Alerts
        </div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{agingCount}</div>
        <div className="mt-1 text-sm text-text-muted">Held over 60 days</div>
      </div>
    </div>
  )
}
