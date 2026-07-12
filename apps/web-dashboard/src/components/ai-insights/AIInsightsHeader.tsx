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
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
          <Sparkles className="h-3.5 w-3.5" />
          RSL Market Intelligence
        </div>
        <h1 className="text-3xl font-bold text-gray-900">RSL Insights</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Prioritize market moves, affected inventory, and selling actions from RSL signals.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onToggleAlerts}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            alertsEnabled ? 'bg-green-600/15 text-green-600' : 'inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2'
          }`}
        >
          <Bell className="h-4 w-4" />
          Alerts {alertsEnabled ? 'On' : 'Off'}
        </button>
        <button type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-transparent bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center gap-2 text-sm">
          <Target className="h-4 w-4" />
          Build Watchlist
        </button>
      </div>
    </div>
  )
}
