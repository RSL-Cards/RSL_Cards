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
      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-400">{period} Revenue</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">
          {formatCurrency(totalRevenue)}
        </div>
        <div className="mt-1 text-sm text-zinc-500">{cardsSold} cards sold in selected period</div>
      </div>
      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-400">Net Profit</div>
        <div className="mt-2 font-mono text-3xl font-bold text-emerald-400">
          {formatCurrency(totalProfit)}
        </div>
        <div className="mt-1 text-sm text-zinc-500">{margin.toFixed(1)}% blended margin</div>
      </div>
      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-400">Top Platform</div>
        <div className="mt-2 text-3xl font-bold text-white">{bestPlatform.platform}</div>
        <div className="mt-1 text-sm text-zinc-500">
          {formatCurrency(bestPlatform.revenue)} reported sales
        </div>
      </div>
      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-400">Aging Alerts</div>
        <div className="mt-2 font-mono text-3xl font-bold text-amber-400">{agingAlerts}</div>
        <div className="mt-1 text-sm text-zinc-500">Inventory held over 60 days</div>
      </div>
    </div>
  )
}
