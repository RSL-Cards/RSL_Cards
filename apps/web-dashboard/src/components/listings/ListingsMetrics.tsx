import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { ActiveListing, ListingPlatformStat } from './listingsUtils'

interface ListingsMetricsProps {
  listings: ActiveListing[]
  platformStats: ListingPlatformStat[]
}

export default function ListingsMetrics({ listings, platformStats }: ListingsMetricsProps) {
  const totalViews = listings.reduce((sum, item) => sum + item.views, 0)
  const totalNet = listings.reduce((sum, item) => sum + item.net, 0)
  const totalWatchers = listings.reduce((sum, item) => sum + item.watchers, 0)
  const totalOffers = listings.reduce((sum, item) => sum + item.offers, 0)

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <div className="metric-card bg-[#0D0D0D] border border-[#252525] rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-400">Active Listings</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{listings.length}</div>
        <div className="mt-1 text-sm text-zinc-500">Across {platformStats.length} platforms</div>
      </div>
      <div className="metric-card bg-[#0D0D0D] border border-[#252525] rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-400">Total Views</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{totalViews.toLocaleString()}</div>
        <div className="mt-1 text-sm text-zinc-500">Synced marketplace analytics</div>
      </div>
      <div className="metric-card bg-[#0D0D0D] border border-[#252525] rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-400">Open Offers</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{totalOffers}</div>
        <div className="mt-1 text-sm text-zinc-500">{totalWatchers} listing watchers</div>
      </div>
      <div className="metric-card bg-[#0D0D0D] border border-[#252525] rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-400">Estimated Net Proceeds</div>
        <div className="mt-2 font-mono text-3xl font-bold text-emerald-400">{formatCurrency(totalNet)}</div>
        <div className="mt-1 text-sm text-zinc-500">Expected after marketplace fees</div>
      </div>
    </div>
  )
}
