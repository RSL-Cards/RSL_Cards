import { AlertTriangle, Bell, ShieldCheck, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { InsightMetrics } from './aiInsightsTypes'

interface AIInsightsMetricsProps {
  metrics: InsightMetrics
}

export default function AIInsightsMetrics({ metrics }: AIInsightsMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          High Confidence
        </div>
        <div className="mt-2 font-mono text-3xl font-bold text-gray-900">{metrics.highConfidence}</div>
        <div className="mt-1 text-sm text-gray-400">Signals at 90% or above</div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          Inventory At Risk
        </div>
        <div className="mt-2 font-mono text-3xl font-bold text-gray-900">{metrics.inventoryAtRisk}</div>
        <div className="mt-1 text-sm text-gray-400">Losing or aging cards</div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <TrendingUp className="h-4 w-4 text-green-600" />
          Upside Exposure
        </div>
        <div className="mt-2 font-mono text-3xl font-bold text-green-600">
          {formatCurrency(metrics.upsideValue)}
        </div>
        <div className="mt-1 text-sm text-gray-400">Inventory with positive comp trend</div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <Bell className="h-4 w-4 text-blue-600" />
          Active Signals
        </div>
        <div className="mt-2 font-mono text-3xl font-bold text-gray-900">{metrics.activeAlerts}</div>
        <div className="mt-1 text-sm text-gray-400">Insights plus market movers</div>
      </div>
    </div>
  )
}
