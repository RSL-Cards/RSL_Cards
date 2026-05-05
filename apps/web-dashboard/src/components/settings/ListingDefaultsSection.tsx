import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { ListingDefaults } from './settingsTypes'
import { listingToggleOptions, requestedPlatforms } from './settingsUtils'

interface ListingDefaultsSectionProps {
  defaultPlatformFee: number
  listingDefaults: ListingDefaults
  onListingDefaultsChange: (listingDefaults: ListingDefaults) => void
}

export default function ListingDefaultsSection({
  defaultPlatformFee,
  listingDefaults,
  onListingDefaultsChange,
}: ListingDefaultsSectionProps) {
  return (
    <section className="dashboard-card">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">Default Listing Settings</h2>
        <p className="mt-1 text-sm text-text-secondary">Set defaults for cross-posting, pricing, shipping, and listing copy.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm text-text-secondary">
          Default Platform
          <select
            value={listingDefaults.platform}
            onChange={(event) => onListingDefaultsChange({ ...listingDefaults, platform: event.target.value })}
            className="dashboard-input mt-2 w-full"
          >
            {requestedPlatforms.map((platform) => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </select>
        </label>
        <label className="text-sm text-text-secondary">
          Pricing Strategy
          <select
            value={listingDefaults.pricingMode}
            onChange={(event) => onListingDefaultsChange({ ...listingDefaults, pricingMode: event.target.value })}
            className="dashboard-input mt-2 w-full"
          >
            <option>Auto optimize by platform fees</option>
            <option>Use market value</option>
            <option>Manual price per platform</option>
          </select>
        </label>
        <label className="text-sm text-text-secondary">
          Target Markup %
          <input
            type="number"
            min="0"
            value={listingDefaults.markup}
            onChange={(event) => onListingDefaultsChange({ ...listingDefaults, markup: event.target.value })}
            className="dashboard-input mt-2 w-full"
          />
        </label>
        <label className="text-sm text-text-secondary">
          Handling Days
          <input
            type="number"
            min="0"
            value={listingDefaults.handlingDays}
            onChange={(event) => onListingDefaultsChange({ ...listingDefaults, handlingDays: event.target.value })}
            className="dashboard-input mt-2 w-full"
          />
        </label>
        <label className="text-sm text-text-secondary">
          Shipping Profile
          <select
            value={listingDefaults.shippingProfile}
            onChange={(event) => onListingDefaultsChange({ ...listingDefaults, shippingProfile: event.target.value })}
            className="dashboard-input mt-2 w-full"
          >
            <option>Buyer paid tracked shipping</option>
            <option>Free standard shipping</option>
            <option>Local pickup only</option>
          </select>
        </label>
        <label className="text-sm text-text-secondary">
          Return Policy
          <select
            value={listingDefaults.returnPolicy}
            onChange={(event) => onListingDefaultsChange({ ...listingDefaults, returnPolicy: event.target.value })}
            className="dashboard-input mt-2 w-full"
          >
            <option>30 day returns</option>
            <option>14 day returns</option>
            <option>No returns</option>
          </select>
        </label>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        {listingToggleOptions.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() =>
              onListingDefaultsChange({
                ...listingDefaults,
                [key]: !listingDefaults[key],
              })
            }
            className={`rounded-lg border p-4 text-left transition-colors ${
              listingDefaults[key]
                ? 'border-success/30 bg-success/5'
                : 'border-border bg-surface-2'
            }`}
          >
            <Icon className="mb-3 h-5 w-5 text-accent-blue" />
            <div className="text-sm font-semibold text-white">{label}</div>
          </button>
        ))}
      </div>

      <label className="mt-4 block text-sm text-text-secondary">
        Default Description
        <textarea
          value={listingDefaults.description}
          onChange={(event) => onListingDefaultsChange({ ...listingDefaults, description: event.target.value })}
          className="dashboard-input mt-2 min-h-28 w-full"
        />
      </label>

      <div className="mt-4 rounded-lg border border-border bg-surface-2 p-4">
        <div className="text-sm font-semibold text-white">Pricing Preview</div>
        <div className="mt-2 text-sm text-text-secondary">
          A {formatCurrency(100)} card listed on {listingDefaults.platform} with {listingDefaults.markup}% markup and {defaultPlatformFee}% fee nets about{' '}
          <span className="font-mono text-success">
            {formatCurrency(Math.round(100 * (1 + Number(listingDefaults.markup || 0) / 100) * (1 - defaultPlatformFee / 100)))}
          </span>.
        </div>
      </div>
    </section>
  )
}
