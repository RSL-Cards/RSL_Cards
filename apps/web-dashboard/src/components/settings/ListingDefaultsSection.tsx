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
    'mt-2 w-full rounded-xl border border-[#252525] bg-[#141414] px-3 py-2 text-sm text-white outline-none transition focus:border-[#E8001C]'

  return (
    <section className="dashboard-card border border-[#252525] bg-[#0D0D0D] p-5 shadow-sm rounded-2xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">Default Listing Settings</h2>
        <p className="mt-1 text-sm text-zinc-400">Set defaults for cross-posting, pricing, shipping, and listing copy.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-zinc-400">
          Default Platform
          <select
            value={listingDefaults.platform}
            onChange={(event) => onListingDefaultsChange({ ...listingDefaults, platform: event.target.value })}
            className={fieldClass}
          >
            {requestedPlatforms.map((platform) => (
              <option key={platform} value={platform} className="bg-[#141414] text-white">{platform}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-zinc-400">
          Pricing Strategy
          <select
            value={listingDefaults.pricingMode}
            onChange={(event) => onListingDefaultsChange({ ...listingDefaults, pricingMode: event.target.value })}
            className={fieldClass}
          >
            <option className="bg-[#141414] text-white">Auto optimize by platform fees</option>
            <option className="bg-[#141414] text-white">Use market value</option>
            <option className="bg-[#141414] text-white">Manual price per platform</option>
          </select>
        </label>
        <label className="text-sm font-medium text-zinc-400">
          Target Markup %
          <input
            type="number"
            min="0"
            value={listingDefaults.markup}
            onChange={(event) => onListingDefaultsChange({ ...listingDefaults, markup: event.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="text-sm font-medium text-zinc-400">
          Handling Days
          <input
            type="number"
            min="0"
            value={listingDefaults.handlingDays}
            onChange={(event) => onListingDefaultsChange({ ...listingDefaults, handlingDays: event.target.value })}
            className={fieldClass}
          />
        </label>
        <label className="text-sm font-medium text-zinc-400">
          Shipping Profile
          <select
            value={listingDefaults.shippingProfile}
            onChange={(event) => onListingDefaultsChange({ ...listingDefaults, shippingProfile: event.target.value })}
            className={fieldClass}
          >
            <option className="bg-[#141414] text-white">Buyer paid tracked shipping</option>
            <option className="bg-[#141414] text-white">Free standard shipping</option>
            <option className="bg-[#141414] text-white">Local pickup only</option>
          </select>
        </label>
        <label className="text-sm font-medium text-zinc-400">
          Return Policy
          <select
            value={listingDefaults.returnPolicy}
            onChange={(event) => onListingDefaultsChange({ ...listingDefaults, returnPolicy: event.target.value })}
            className={fieldClass}
          >
            <option className="bg-[#141414] text-white">30 day returns</option>
            <option className="bg-[#141414] text-white">14 day returns</option>
            <option className="bg-[#141414] text-white">No returns</option>
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
                ? 'border-[#E8001C]/30 bg-[#E8001C]/15 text-white'
                : 'border-[#252525] bg-[#141414] text-zinc-400 hover:bg-[#1A1A1A] hover:text-white'
            }`}
          >
            <Icon className={`mb-3 h-5 w-5 ${listingDefaults[key] ? 'text-[#E8001C]' : 'text-zinc-500'}`} />
            <div className="text-sm font-semibold text-white">{label}</div>
          </button>
        ))}
      </div>

      <label className="mt-4 block text-sm font-medium text-zinc-400">
        Default Description
        <textarea
          value={listingDefaults.description}
          onChange={(event) => onListingDefaultsChange({ ...listingDefaults, description: event.target.value })}
          className={`${fieldClass} min-h-28 resize-y`}
        />
      </label>

      <div className="mt-4 rounded-xl border border-[#252525] bg-[#141414] p-4">
        <div className="text-sm font-semibold text-white">Pricing Preview</div>
        <div className="mt-2 text-sm text-zinc-400">
          A {formatCurrency(100)} card listed on {listingDefaults.platform} with {listingDefaults.markup}% markup and {defaultPlatformFee}% fee nets about{' '}
          <span className="font-mono font-semibold text-emerald-400">
            {formatCurrency(Math.round(100 * (1 + Number(listingDefaults.markup || 0) / 100) * (1 - defaultPlatformFee / 100)))}
          </span>.
        </div>
      </div>
    </section>
  )
}
