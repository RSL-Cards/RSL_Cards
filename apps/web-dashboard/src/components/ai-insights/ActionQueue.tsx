import { CheckCircle2 } from 'lucide-react'
import { InsightAction } from './aiInsightsTypes'

interface ActionQueueProps {
  actions: InsightAction[]
  completedActions: string[]
  onToggleAction: (actionId: string) => void
}

export default function ActionQueue({
  actions,
  completedActions,
  onToggleAction,
}: ActionQueueProps) {
  return (
    <div className="dashboard-card">
      <h2 className="text-xl font-bold text-white">Action Queue</h2>
      <div className="mt-4 space-y-3">
        {actions.map((action) => {
          const isComplete = completedActions.includes(action.id)

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onToggleAction(action.id)}
              className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                isComplete
                  ? 'border-success/30 bg-success/5'
                  : 'border-border bg-surface-2 hover:border-white/20'
              }`}
            >
              <CheckCircle2 className={`mt-0.5 h-5 w-5 ${isComplete ? 'text-success' : 'text-text-muted'}`} />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-white">{action.player}</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    action.priority === 'High'
                      ? 'bg-accent-red/15 text-accent-red'
                      : action.priority === 'Medium'
                        ? 'bg-warning/15 text-warning'
                        : 'bg-accent-blue/15 text-accent-blue'
                  }`}>
                    {action.priority}
                  </span>
                </div>
                <div className="mt-1 text-sm text-text-secondary">{action.action}</div>
                <div className="mt-2 text-xs text-text-muted">{action.due}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
