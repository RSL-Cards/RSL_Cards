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
  const costOfGoodsSold = Math.max(0, totalRevenue - totalProfit)

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
        <div className="text-sm font-medium text-zinc-400">Cost of Cards Sold</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">
          {formatCurrency(costOfGoodsSold)}
        </div>
        <div className="mt-1 text-xs text-zinc-500">Cost basis of cards sold in period</div>
      </div>
      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-400">Net Profit</div>
        <div className={`mt-2 font-mono text-3xl font-bold ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatCurrency(totalProfit)}
        </div>
        <div className="mt-1 text-sm text-zinc-500">After card costs &amp; recorded expenses</div>
      </div>
      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-400">Profit Margin</div>
        <div className="mt-2 font-mono text-3xl font-bold text-emerald-400">
          {margin.toFixed(1)}%
        </div>
        <div className="mt-1 text-sm text-zinc-500">Blended period profit margin</div>
      </div>
    </div>
  )
}
