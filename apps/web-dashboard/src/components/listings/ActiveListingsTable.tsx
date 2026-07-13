import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { BarChart3, Edit3, Megaphone, RotateCcw, Trash2 } from 'lucide-react'
import { ActiveListing } from './listingsUtils'

interface ActiveListingsTableProps {
  listings: ActiveListing[]
  onStatusChange: (id: string, status: string) => void
}

export default function ActiveListingsTable({ listings, onStatusChange }: ActiveListingsTableProps) {
  return (
    <div className="dashboard-card border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">All Active Listings</h2>
          <p className="mt-1 text-sm text-gray-500">Auto-deactivation is enabled when a card sells on one platform.</p>
        </div>
        <div className="flex w-fit items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
          <BarChart3 className="h-4 w-4" />
          Live performance analytics
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px]">
          <thead>
            <tr>
              {['Card', 'Platform', 'Price', 'Views', 'Watchers', 'Offers', 'Days Listed', 'Status', 'Actions'].map((heading) => (
                <th key={heading} className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {listings.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-sm text-gray-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="rounded-full bg-gray-50 p-3">
                      <Megaphone className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="font-medium text-gray-900">No active listings</p>
                    <p>When you list cards on marketplaces, they will appear here.</p>
                  </div>
                </td>
              </tr>
            ) : (
              listings.map((listing) => (
                <tr key={listing.id} className="transition-colors duration-200 hover:bg-gray-50">
                  <td className="py-3">
                    <div className="font-semibold text-gray-900">{listing.card}</div>
                    <div className="text-xs text-gray-400">Net {formatCurrency(listing.net)}</div>
                  </td>
                  <td className="py-3 text-sm text-gray-500">{listing.platform}</td>
                  <td className="py-3 font-mono text-gray-900">{formatCurrency(listing.price)}</td>
                  <td className="py-3 font-mono text-gray-900">{listing.views}</td>
                  <td className="py-3 font-mono text-gray-900">{listing.watchers}</td>
                  <td className="py-3 font-mono text-gray-900">{listing.offers}</td>
                  <td className="py-3 font-mono text-gray-900">{listing.daysListed}</td>
                  <td className="py-3">
                    <span className={listing.status === 'Active' ? 'chip-success' : listing.status === 'Scheduled' ? 'chip-blue' : 'chip-warning'}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit Price
                      </button>
                      <button type="button" onClick={() => onStatusChange(listing.id, 'Ended')} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700">
                        <Trash2 className="h-3.5 w-3.5" />
                        End
                      </button>
                      <button type="button" onClick={() => onStatusChange(listing.id, 'Active')} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700">
                        <RotateCcw className="h-3.5 w-3.5" />
                        Relist
                      </button>
                      <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700">
                        <Megaphone className="h-3.5 w-3.5" />
                        Promote
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
