import { Save } from 'lucide-react'

interface SettingsHeaderProps {
  saveMessage: string
  onSave: () => void
}

export default function SettingsHeader({ saveMessage, onSave }: SettingsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-400">
          Manage account details, marketplace connections, payments, alerts, listing defaults, and team access.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {saveMessage && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-400">
            {saveMessage}
          </div>
        )}
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-xl bg-[#E8001C] hover:bg-[#CC0018] px-3 py-2 text-sm font-semibold text-white shadow-sm transition"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>
    </div>
  )
}
