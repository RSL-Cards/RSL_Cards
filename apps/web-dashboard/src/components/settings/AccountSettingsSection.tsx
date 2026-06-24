
import { AccountSettings } from './settingsTypes'

interface AccountSettingsSectionProps {
  account: AccountSettings
  onAccountChange: (account: AccountSettings) => void
}

export default function AccountSettingsSection({
  account,
  onAccountChange,
}: AccountSettingsSectionProps) {
  const inputClass =
    'mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

  return (
    <section className="dashboard-card border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Account</h2>
          <p className="mt-1 text-sm text-gray-500">Dealer profile and account identity.</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
          {account.displayName?.charAt(0)?.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-gray-600">
          Display Name
          <input
            value={account.displayName}
            onChange={(event) => onAccountChange({ ...account, displayName: event.target.value })}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-medium text-gray-600">
          Custom URL
          <div className="mt-2 flex overflow-hidden rounded-xl border border-gray-200 bg-white transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            <span className="border-r border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400">rslcards.com/</span>
            <input
              value={account.customUrl}
              onChange={(event) => onAccountChange({ ...account, customUrl: event.target.value })}
              className="w-full bg-transparent px-3 py-2 text-sm text-gray-900 outline-none"
            />
          </div>
        </label>
        <label className="text-sm font-medium text-gray-600">
          Email
          <input
            value={account.email}
            onChange={(event) => onAccountChange({ ...account, email: event.target.value })}
            className={inputClass}
          />
        </label>



      </div>
    </section>
  )
}
