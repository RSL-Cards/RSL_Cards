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
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">{period} Revenue</div>
        <div className="mt-2 font-mono text-3xl font-bold text-gray-900">
          {formatCurrency(totalRevenue)}
        </div>
        <div className="mt-1 text-sm text-gray-400">{cardsSold} cards sold in selected period</div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Net Profit</div>
        <div className="mt-2 font-mono text-3xl font-bold text-green-600">
          {formatCurrency(totalProfit)}
        </div>
        <div className="mt-1 text-sm text-gray-400">{margin.toFixed(1)}% blended margin</div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Top Platform</div>
        <div className="mt-2 text-3xl font-bold text-gray-900">{bestPlatform.platform}</div>
        <div className="mt-1 text-sm text-gray-400">
          {formatCurrency(bestPlatform.revenue)} reported sales
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Aging Alerts</div>
        <div className="mt-2 font-mono text-3xl font-bold text-yellow-600">{agingAlerts}</div>
        <div className="mt-1 text-sm text-gray-400">Inventory held over 60 days</div>
      </div>
    </div>
  )
}
