import { Crown } from 'lucide-react'
import { DEALER } from '@/data/mockDashboard'
import { AccountSettings } from './settingsTypes'

interface AccountSettingsSectionProps {
  account: AccountSettings
  onAccountChange: (account: AccountSettings) => void
}

export default function AccountSettingsSection({
  account,
  onAccountChange,
}: AccountSettingsSectionProps) {
  return (
    <section className="dashboard-card">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Account</h2>
          <p className="mt-1 text-sm text-text-secondary">Dealer profile and account identity.</p>
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: DEALER.avatar_color }}
        >
          {DEALER.initials}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm text-text-secondary">
          Display Name
          <input
            value={account.displayName}
            onChange={(event) => onAccountChange({ ...account, displayName: event.target.value })}
            className="dashboard-input mt-2 w-full"
          />
        </label>
        <label className="text-sm text-text-secondary">
          Custom URL
          <div className="mt-2 flex rounded-lg border border-border bg-surface-2">
            <span className="px-3 py-2 text-sm text-text-muted">rslcards.com/</span>
            <input
              value={account.customUrl}
              onChange={(event) => onAccountChange({ ...account, customUrl: event.target.value })}
              className="w-full bg-transparent px-3 py-2 text-white outline-none"
            />
          </div>
        </label>
        <label className="text-sm text-text-secondary">
          Email
          <input
            value={account.email}
            onChange={(event) => onAccountChange({ ...account, email: event.target.value })}
            className="dashboard-input mt-2 w-full"
          />
        </label>
        <label className="text-sm text-text-secondary">
          Support Email
          <input
            value={account.supportEmail}
            onChange={(event) => onAccountChange({ ...account, supportEmail: event.target.value })}
            className="dashboard-input mt-2 w-full"
          />
        </label>
        <label className="text-sm text-text-secondary">
          Timezone
          <select
            value={account.timezone}
            onChange={(event) => onAccountChange({ ...account, timezone: event.target.value })}
            className="dashboard-input mt-2 w-full"
          >
            <option value="America/Chicago">America/Chicago</option>
            <option value="America/New_York">America/New_York</option>
            <option value="America/Los_Angeles">America/Los_Angeles</option>
            <option value="Asia/Calcutta">Asia/Calcutta</option>
          </select>
        </label>
        <div className="rounded-lg border border-border bg-surface-2 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Crown className="h-4 w-4 text-warning" />
            {DEALER.plan.toUpperCase()} Plan
          </div>
          <div className="mt-2 text-sm text-text-secondary">
            Rating {DEALER.dealer_profile.rating} from {DEALER.dealer_profile.review_count} reviews.
          </div>
        </div>
      </div>
    </section>
  )
}
