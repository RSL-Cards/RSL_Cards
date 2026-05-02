import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { BarChart3, Edit3, Megaphone, RotateCcw, Trash2 } from 'lucide-react'
import { ActiveListing } from './listingsUtils'

interface ActiveListingsTableProps {
  listings: ActiveListing[]
  onStatusChange: (id: string, status: string) => void
}

export default function ActiveListingsTable({ listings, onStatusChange }: ActiveListingsTableProps) {
  return (
    <div className="dashboard-card">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">All Active Listings</h2>
          <p className="mt-1 text-sm text-text-secondary">Auto-deactivation is enabled when a card sells on one platform.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-success">
          <BarChart3 className="h-4 w-4" />
          Live performance analytics
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px]">
          <thead>
            <tr>
              {['Card', 'Platform', 'Price', 'Views', 'Watchers', 'Offers', 'Days Listed', 'Status', 'Actions'].map((heading) => (
                <th key={heading} className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {listings.map((listing) => (
              <tr key={listing.id} className="transition-colors duration-200 hover:bg-white/5">
                <td className="py-3">
                  <div className="font-semibold text-white">{listing.card}</div>
                  <div className="text-xs text-text-muted">Net {formatCurrency(listing.net)}</div>
                </td>
                <td className="py-3 text-sm text-text-secondary">{listing.platform}</td>
                <td className="py-3 font-mono text-white">{formatCurrency(listing.price)}</td>
                <td className="py-3 font-mono text-white">{listing.views}</td>
                <td className="py-3 font-mono text-white">{listing.watchers}</td>
                <td className="py-3 font-mono text-white">{listing.offers}</td>
                <td className="py-3 font-mono text-white">{listing.daysListed}</td>
                <td className="py-3">
                  <span className={listing.status === 'Active' ? 'chip-success' : listing.status === 'Scheduled' ? 'chip-blue' : 'chip-warning'}>
                    {listing.status}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn-outline inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs">
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit Price
                    </button>
                    <button type="button" onClick={() => onStatusChange(listing.id, 'Ended')} className="btn-outline inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs">
                      <Trash2 className="h-3.5 w-3.5" />
                      End
                    </button>
                    <button type="button" onClick={() => onStatusChange(listing.id, 'Active')} className="btn-outline inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs">
                      <RotateCcw className="h-3.5 w-3.5" />
                      Relist
                    </button>
                    <button type="button" className="btn-outline inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs">
                      <Megaphone className="h-3.5 w-3.5" />
                      Promote
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
