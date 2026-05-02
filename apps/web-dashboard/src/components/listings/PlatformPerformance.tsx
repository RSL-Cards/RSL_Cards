import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { ListingPlatformStat } from './listingsUtils'

interface PlatformPerformanceProps {
  platformStats: ListingPlatformStat[]
}

export default function PlatformPerformance({ platformStats }: PlatformPerformanceProps) {
  return (
    <div className="dashboard-card">
      <h2 className="mb-4 text-xl font-bold text-white">Performance by Platform</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {platformStats.map((stat) => (
          <div key={stat.platform} className="rounded-lg border border-border bg-white/5 p-4">
            <div className="font-semibold text-white">{stat.platform}</div>
            <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-text-muted">Listings</div>
                <div className="font-mono text-white">{stat.count}</div>
              </div>
              <div>
                <div className="text-text-muted">Views</div>
                <div className="font-mono text-white">{stat.views}</div>
              </div>
              <div>
                <div className="text-text-muted">Net</div>
                <div className="font-mono text-success">{formatCurrency(stat.net)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
