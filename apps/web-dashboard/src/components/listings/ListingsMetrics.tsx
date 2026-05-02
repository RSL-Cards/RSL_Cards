import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { ActiveListing, ListingPlatformStat } from './listingsUtils'

interface ListingsMetricsProps {
  listings: ActiveListing[]
  platformStats: ListingPlatformStat[]
}

export default function ListingsMetrics({ listings, platformStats }: ListingsMetricsProps) {
  const totalViews = listings.reduce((sum, item) => sum + item.views, 0)
  const totalNet = listings.reduce((sum, item) => sum + item.net, 0)

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="metric-card">
        <div className="text-sm font-medium text-text-secondary">Active Listings</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{listings.length}</div>
        <div className="mt-1 text-sm text-text-muted">Across {platformStats.length} platforms</div>
      </div>
      <div className="metric-card">
        <div className="text-sm font-medium text-text-secondary">Total Views</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{totalViews.toLocaleString()}</div>
        <div className="mt-1 text-sm text-text-muted">Synced marketplace analytics</div>
      </div>
      <div className="metric-card">
        <div className="text-sm font-medium text-text-secondary">Est. Net Value</div>
        <div className="mt-2 font-mono text-3xl font-bold text-success">{formatCurrency(totalNet)}</div>
        <div className="mt-1 text-sm text-text-muted">After estimated fees</div>
      </div>
    </div>
  )
}
