import { AlertTriangle, Bell, ShieldCheck, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { InsightMetrics } from './aiInsightsTypes'

interface AIInsightsMetricsProps {
  metrics: InsightMetrics
}

export default function AIInsightsMetrics({ metrics }: AIInsightsMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          High Confidence
        </div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{metrics.highConfidence}</div>
        <div className="mt-1 text-sm text-zinc-500">Signals at 90% or above</div>
      </div>
      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          Inventory At Risk
        </div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{metrics.inventoryAtRisk}</div>
        <div className="mt-1 text-sm text-zinc-500">Losing or aging cards</div>
      </div>
      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          Upside Exposure
        </div>
        <div className="mt-2 font-mono text-3xl font-bold text-emerald-400">
          {formatCurrency(metrics.upsideValue)}
        </div>
        <div className="mt-1 text-sm text-zinc-500">Inventory with positive comp trend</div>
      </div>
      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
          <Bell className="h-4 w-4 text-blue-400" />
          Active Signals
        </div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{metrics.activeAlerts}</div>
        <div className="mt-1 text-sm text-zinc-500">Insights plus market movers</div>
      </div>
    </div>
  )
}
