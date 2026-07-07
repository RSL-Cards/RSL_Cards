import { BrainCircuit, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { MarginReportItem, PlatformSales, ReportPeriod } from './reportsTypes'

interface Insight {
  id: string
  player: string
  headline: string
}

interface AISummaryProps {
  agingAlerts: number
  bestMarginGroup: MarginReportItem
  bestPlatform: PlatformSales
  insights: Insight[]
  period: ReportPeriod
  totalProfit: number
  totalRevenue: number
}

export default function AISummary({
  agingAlerts,
  bestMarginGroup,
  bestPlatform,
  insights,
  period,
  totalProfit,
  totalRevenue,
}: AISummaryProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <BrainCircuit className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">AI Summary</h2>
      </div>
      <div className="space-y-4">
        <p className="text-sm leading-6 text-gray-500">
          {period} performance is led by {bestPlatform.platform}, with total sales of{' '}
          {formatCurrency(totalRevenue)} and {formatCurrency(totalProfit)} in profit.{' '}
          {bestMarginGroup.name} is the strongest margin segment at{' '}
          {bestMarginGroup.margin.toFixed(1)}%.
        </p>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-600">
            <TrendingUp className="h-4 w-4" />
            Recommended focus
          </div>
          <div className="text-sm text-gray-500">
            Prioritize Football inventory and review {agingAlerts} aging cards before the next
            listing cycle.
          </div>
        </div>
        {insights.slice(0, 2).map((insight) => (
          <div key={insight.id} className="rounded-lg bg-gray-50 p-3">
            <div className="text-sm font-semibold text-gray-900">{insight.player}</div>
            <div className="mt-1 text-xs leading-5 text-gray-400">{insight.headline}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
