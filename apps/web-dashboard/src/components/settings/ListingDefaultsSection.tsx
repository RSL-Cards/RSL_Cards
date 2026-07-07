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
  const fieldClass =
    'mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

  return (
    <section className="dashboard-card border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Default Listing Settings</h2>
        <p className="mt-1 text-sm text-gray-500">Set defaults for cross-posting, pricing, shipping, and listing copy.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-gray-600">
          Default Platform
          <select
            value={listingDefaults.platform}
            onChange={(event) => onListingDefaultsChange({ ...listingDefaults, platform: event.target.value })}
            className={fieldClass}
          >
            {requestedPlatforms.map((platform) => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-600">
          Pricing Strategy
          <select
            value={listingDefaults.pricingMode}
            onChange={(event) => onListingDefaultsChange({ ...listingDefaults, pricingMode: event.target.value })}
            className={fieldClass}
          >
            <option>Auto optimize by platform fees</option>
            <option>Use market value</option>
            <option>Manual price per platform</option>
          </select>
        </label>
        <label className="text-sm font-medium text-gray-600">
          Target Markup %
          <input
            type="number"
            min="0"
            value={listingDefaults.markup}
            onChange={(event) => onListingDefaultsChange({ ...listingDefaults, markup: event.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="text-sm font-medium text-gray-600">
          Handling Days
          <input
            type="number"
            min="0"
            value={listingDefaults.handlingDays}
            onChange={(event) => onListingDefaultsChange({ ...listingDefaults, handlingDays: event.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="text-sm font-medium text-gray-600">
          Shipping Profile
          <select
            value={listingDefaults.shippingProfile}
            onChange={(event) => onListingDefaultsChange({ ...listingDefaults, shippingProfile: event.target.value })}
            className={fieldClass}
          >
            <option>Buyer paid tracked shipping</option>
            <option>Free standard shipping</option>
            <option>Local pickup only</option>
          </select>
        </label>
        <label className="text-sm font-medium text-gray-600">
          Return Policy
          <select
            value={listingDefaults.returnPolicy}
            onChange={(event) => onListingDefaultsChange({ ...listingDefaults, returnPolicy: event.target.value })}
            className={fieldClass}
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
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-gray-50 hover:bg-white'
            }`}
          >
            <Icon className="mb-3 h-5 w-5 text-blue-600" />
            <div className="text-sm font-semibold text-gray-900">{label}</div>
          </button>
        ))}
      </div>

      <label className="mt-4 block text-sm font-medium text-gray-600">
        Default Description
        <textarea
          value={listingDefaults.description}
          onChange={(event) => onListingDefaultsChange({ ...listingDefaults, description: event.target.value })}
          className={`${fieldClass} min-h-28 resize-y`}
        />
      </label>

      <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="text-sm font-semibold text-gray-900">Pricing Preview</div>
        <div className="mt-2 text-sm text-gray-600">
          A {formatCurrency(100)} card listed on {listingDefaults.platform} with {listingDefaults.markup}% markup and {defaultPlatformFee}% fee nets about{' '}
          <span className="font-mono font-semibold text-green-700">
            {formatCurrency(Math.round(100 * (1 + Number(listingDefaults.markup || 0) / 100) * (1 - defaultPlatformFee / 100)))}
          </span>.
        </div>
      </div>
    </section>
  )
}
