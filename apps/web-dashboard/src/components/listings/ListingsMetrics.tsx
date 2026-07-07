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
      <div className="metric-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Active Listings</div>
        <div className="mt-2 font-mono text-3xl font-bold text-gray-900">{listings.length}</div>
        <div className="mt-1 text-sm text-gray-400">Across {platformStats.length} platforms</div>
      </div>
      <div className="metric-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Total Views</div>
        <div className="mt-2 font-mono text-3xl font-bold text-gray-900">{totalViews.toLocaleString()}</div>
        <div className="mt-1 text-sm text-gray-400">Synced marketplace analytics</div>
      </div>
      <div className="metric-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Buyer Signals</div>
        <div className="mt-2 font-mono text-3xl font-bold text-gray-900">{totalWatchers}</div>
        <div className="mt-1 text-sm text-gray-400">{totalOffers} open offers</div>
      </div>
      <div className="metric-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Est. Net Value</div>
        <div className="mt-2 font-mono text-3xl font-bold text-green-600">{formatCurrency(totalNet)}</div>
        <div className="mt-1 text-sm text-gray-400">After estimated fees</div>
      </div>
    </div>
  )
}
