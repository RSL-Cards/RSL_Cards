import { Save, Settings } from 'lucide-react'

interface SettingsHeaderProps {
  saveMessage: string
  onSave: () => void
}

export default function SettingsHeader({ saveMessage, onSave }: SettingsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent-blue/30 bg-accent-blue/10 px-3 py-1 text-xs font-semibold text-accent-blue">
          <Settings className="h-3.5 w-3.5" />
          Dealer Workspace
        </div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-1 max-w-2xl text-sm text-text-secondary">
          Manage account details, marketplace connections, payments, alerts, listing defaults, and team access.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {saveMessage && (
          <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm font-medium text-success">
            {saveMessage}
          </div>
        )}
        <button
          type="button"
          onClick={onSave}
          className="btn-primary inline-flex items-center gap-2 text-sm"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>
    </div>
  )
}
