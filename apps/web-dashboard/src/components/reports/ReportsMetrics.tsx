import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { PlatformSales, ReportPeriod } from './reportsTypes'

interface ReportsMetricsProps {
  agingAlerts: number
  bestPlatform: PlatformSales
  cardsSold: number
  margin: number
  period: ReportPeriod
  totalProfit: number
  totalRevenue: number
}

export default function ReportsMetrics({
  agingAlerts,
  bestPlatform,
  cardsSold,
  margin,
  period,
  totalProfit,
  totalRevenue,
}: ReportsMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <div className="metric-card">
        <div className="text-sm font-medium text-text-secondary">{period} Revenue</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">
          {formatCurrency(totalRevenue)}
        </div>
        <div className="mt-1 text-sm text-text-muted">{cardsSold} cards sold in selected period</div>
      </div>
      <div className="metric-card">
        <div className="text-sm font-medium text-text-secondary">Net Profit</div>
        <div className="mt-2 font-mono text-3xl font-bold text-success">
          {formatCurrency(totalProfit)}
        </div>
        <div className="mt-1 text-sm text-text-muted">{margin.toFixed(1)}% blended margin</div>
      </div>
      <div className="metric-card">
        <div className="text-sm font-medium text-text-secondary">Top Platform</div>
        <div className="mt-2 text-3xl font-bold text-white">{bestPlatform.platform}</div>
        <div className="mt-1 text-sm text-text-muted">
          {formatCurrency(bestPlatform.revenue)} reported sales
        </div>
      </div>
      <div className="metric-card">
        <div className="text-sm font-medium text-text-secondary">Aging Alerts</div>
        <div className="mt-2 font-mono text-3xl font-bold text-warning">{agingAlerts}</div>
        <div className="mt-1 text-sm text-text-muted">Inventory held over 60 days</div>
      </div>
    </div>
  )
}
