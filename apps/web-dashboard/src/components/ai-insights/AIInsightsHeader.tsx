import { Bell, Sparkles, Target } from 'lucide-react'

interface AIInsightsHeaderProps {
  alertsEnabled: boolean
  onToggleAlerts: () => void
}

export default function AIInsightsHeader({
  alertsEnabled,
  onToggleAlerts,
}: AIInsightsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent-blue/30 bg-accent-blue/10 px-3 py-1 text-xs font-semibold text-accent-blue">
          <Sparkles className="h-3.5 w-3.5" />
          AI Market Intelligence
        </div>
        <h1 className="text-3xl font-bold text-white">AI Insights</h1>
        <p className="mt-1 max-w-2xl text-sm text-text-secondary">
          Prioritize market moves, affected inventory, and selling actions from AI signals.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onToggleAlerts}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            alertsEnabled ? 'bg-success/15 text-success' : 'btn-outline'
          }`}
        >
          <Bell className="h-4 w-4" />
          Alerts {alertsEnabled ? 'On' : 'Off'}
        </button>
        <button type="button" className="btn-primary inline-flex items-center gap-2 text-sm">
          <Target className="h-4 w-4" />
          Build Watchlist
        </button>
      </div>
    </div>
  )
}
