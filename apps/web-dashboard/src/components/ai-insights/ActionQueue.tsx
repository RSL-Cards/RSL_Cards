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
    <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
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
                  ? 'border-emerald-500/30 bg-emerald-500/10'
                  : 'border-[#252525] bg-[#141414] hover:bg-[#1A1A1A]'
              }`}
            >
              <CheckCircle2 className={`mt-0.5 h-5 w-5 ${isComplete ? 'text-emerald-400' : 'text-zinc-500'}`} />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-white">{action.player}</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    action.priority === 'High'
                      ? 'bg-red-500/15 border border-red-500/30 text-red-400'
                      : action.priority === 'Medium'
                        ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                        : 'bg-blue-500/15 border border-blue-500/30 text-blue-400'
                  }`}>
                    {action.priority}
                  </span>
                </div>
                <div className="mt-1 text-sm text-zinc-400">{action.action}</div>
                <div className="mt-2 text-xs text-zinc-500">{action.due}</div>
              </div>
            </button>
          )
        })}

        {actions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[#252525] rounded-xl bg-[#141414]">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">All caught up!</h3>
            <p className="mt-1 max-w-sm text-xs text-zinc-400">
              There are currently no pending dealer actions or price adjustment recommendations from RSL narratives.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}