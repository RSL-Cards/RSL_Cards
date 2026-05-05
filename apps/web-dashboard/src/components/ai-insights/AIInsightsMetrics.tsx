import { AlertTriangle, Bell, ShieldCheck, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { InsightMetrics } from './aiInsightsTypes'

interface AIInsightsMetricsProps {
  metrics: InsightMetrics
}

export default function AIInsightsMetrics({ metrics }: AIInsightsMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <div className="metric-card">
        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <ShieldCheck className="h-4 w-4 text-success" />
          High Confidence
        </div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{metrics.highConfidence}</div>
        <div className="mt-1 text-sm text-text-muted">Signals at 90% or above</div>
      </div>
      <div className="metric-card">
        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <AlertTriangle className="h-4 w-4 text-warning" />
          Inventory At Risk
        </div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{metrics.inventoryAtRisk}</div>
        <div className="mt-1 text-sm text-text-muted">Losing or aging cards</div>
      </div>
      <div className="metric-card">
        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <TrendingUp className="h-4 w-4 text-success" />
          Upside Exposure
        </div>
        <div className="mt-2 font-mono text-3xl font-bold text-success">
          {formatCurrency(metrics.upsideValue)}
        </div>
        <div className="mt-1 text-sm text-text-muted">Inventory with positive comp trend</div>
      </div>
      <div className="metric-card">
        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <Bell className="h-4 w-4 text-accent-blue" />
          Active Signals
        </div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{metrics.activeAlerts}</div>
        <div className="mt-1 text-sm text-text-muted">Insights plus market movers</div>
      </div>
    </div>
  )
}
