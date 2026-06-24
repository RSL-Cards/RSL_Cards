import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { ListingPlatformStat } from './listingsUtils'

interface PlatformPerformanceProps {
  platformStats: ListingPlatformStat[]
}

export default function PlatformPerformance({ platformStats }: PlatformPerformanceProps) {
  return (
    <div className="dashboard-card border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-gray-900">Performance by Platform</h2>
      <div className="grid grid-cols-1 gap-3">
        {platformStats.map((stat) => (
          <div key={stat.platform} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="font-semibold text-gray-900">{stat.platform}</div>
            <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-gray-400">Listings</div>
                <div className="font-mono text-gray-900">{stat.count}</div>
              </div>
              <div>
                <div className="text-gray-400">Views</div>
                <div className="font-mono text-gray-900">{stat.views}</div>
              </div>
              <div>
                <div className="text-gray-400">Net</div>
                <div className="font-mono text-green-600">{formatCurrency(stat.net)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
