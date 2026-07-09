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
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">Action Queue</h2>
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
                  ? 'border-success/30 bg-green-600/5'
                  : 'border-gray-200 bg-gray-50 hover:border-white/20'
              }`}
            >
              <CheckCircle2 className={`mt-0.5 h-5 w-5 ${isComplete ? 'text-green-600' : 'text-gray-400'}`} />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-gray-900">{action.player}</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    action.priority === 'High'
                      ? 'bg-red-600/15 text-red-600'
                      : action.priority === 'Medium'
                        ? 'bg-warning/15 text-yellow-600'
                        : 'bg-blue-600/15 text-blue-600'
                  }`}>
                    {action.priority}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-500">{action.action}</div>
                <div className="mt-2 text-xs text-gray-400">{action.due}</div>
              </div>
            </button>
          )
        })}

        {actions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/60">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">All caught up!</h3>
            <p className="mt-1 max-w-sm text-xs text-gray-400">
              There are currently no pending dealer actions or price adjustment recommendations from RSL narratives.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}