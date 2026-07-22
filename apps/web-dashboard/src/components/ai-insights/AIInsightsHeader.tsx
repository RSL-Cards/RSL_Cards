import { Sparkles } from 'lucide-react'

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
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#E8001C]/30 bg-[#E8001C]/15 px-3 py-1 text-xs font-semibold text-[#E8001C]">
          <Sparkles className="h-3.5 w-3.5" />
          RSL Market Intelligence
        </div>
        <h1 className="text-3xl font-bold text-white">RSL Insights</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-400">
          Prioritize market moves, affected inventory, and selling actions from RSL signals.
        </p>
      </div>


    </div>
  )
}
