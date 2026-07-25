import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { BarChart3, Edit3, Megaphone, RotateCcw, Trash2 } from 'lucide-react'
import { ActiveListing } from './listingsUtils'

interface ActiveListingsTableProps {
  listings: ActiveListing[]
  onStatusChange: (id: string, status: string) => void
}

export default function ActiveListingsTable({ listings, onStatusChange }: ActiveListingsTableProps) {
  return (
    <div className="dashboard-card border border-[#252525] bg-[#0D0D0D] p-5 shadow-sm rounded-2xl">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">All Active Listings</h2>
          <p className="mt-1 text-sm text-zinc-400">Auto-deactivation is enabled when a card sells on one platform.</p>
        </div>
        <div className="flex w-fit items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-400">
          <BarChart3 className="h-4 w-4" />
          Live performance analytics
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px]">
          <thead>
            <tr className="border-b border-[#252525]">
              {['Card', 'Platform', 'Price', 'Views', 'Watchers', 'Offers', 'Days Listed', 'Status', 'Actions'].map((heading) => (
                <th key={heading} className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252525]">
            {listings.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-sm text-zinc-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="rounded-full bg-[#141414] border border-[#252525] p-3">
                      <Megaphone className="h-6 w-6 text-zinc-500" />
                    </div>
                    <p className="font-medium text-white">No active listings</p>
                    <p className="text-zinc-500">When you list cards on marketplaces, they will appear here.</p>
                  </div>
                </td>
              </tr>
            ) : (
              listings.map((listing) => (
                <tr key={listing.id} className="transition-colors duration-200 hover:bg-[#141414]">
                  <td className="py-3">
                    <div className="font-semibold text-white">{listing.card}</div>
                    <div className="text-xs text-zinc-400">Net {formatCurrency(listing.net)}</div>
                  </td>
                  <td className="py-3 text-sm text-zinc-400">{listing.platform}</td>
                  <td className="py-3 font-mono text-white">{formatCurrency(listing.price)}</td>
                  <td className="py-3 font-mono text-white">{listing.views}</td>
                  <td className="py-3 font-mono text-white">{listing.watchers}</td>
                  <td className="py-3 font-mono text-white">{listing.offers}</td>
                  <td className="py-3 font-mono text-white">{listing.daysListed}</td>
                  <td className="py-3">
                    <span className={listing.status === 'Active' ? 'inline-flex rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400' : listing.status === 'Scheduled' ? 'inline-flex rounded-full bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 text-xs font-semibold text-blue-400' : 'inline-flex rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-400'}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-[#252525] bg-[#141414] px-2 py-1 text-xs font-medium text-zinc-300 transition hover:bg-[#1A1A1A] hover:text-white">
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit Price
                      </button>
                      <button type="button" onClick={() => onStatusChange(listing.id, 'Ended')} className="inline-flex items-center gap-1 rounded-lg border border-[#252525] bg-[#141414] px-2 py-1 text-xs font-medium text-zinc-300 transition hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-400">
                        <Trash2 className="h-3.5 w-3.5" />
                        End
                      </button>
                      <button type="button" onClick={() => onStatusChange(listing.id, 'Active')} className="inline-flex items-center gap-1 rounded-lg border border-[#252525] bg-[#141414] px-2 py-1 text-xs font-medium text-zinc-300 transition hover:bg-emerald-500/15 hover:border-emerald-500/30 hover:text-emerald-400">
                        <RotateCcw className="h-3.5 w-3.5" />
                        Relist
                      </button>
                      <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-[#252525] bg-[#141414] px-2 py-1 text-xs font-medium text-zinc-300 transition hover:bg-amber-500/15 hover:border-amber-500/30 hover:text-amber-400">
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
