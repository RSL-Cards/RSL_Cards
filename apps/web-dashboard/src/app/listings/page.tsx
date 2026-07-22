'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock, Eye, Tag } from 'lucide-react'
import Shell from '@/components/layout/Shell'
import ActiveListingsTable from '@/components/listings/ActiveListingsTable'
import ListingsHeader from '@/components/listings/ListingsHeader'
import ListingsMetrics from '@/components/listings/ListingsMetrics'
import PlatformPerformance from '@/components/listings/PlatformPerformance'
import {
  ActiveListing,
  getPlatformStats,
} from '@/components/listings/listingsUtils'
import { apiClient } from '@/lib/axios'

export default function ListingsPage() {
  const [listings, setListings] = useState<ActiveListing[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { data } = await apiClient.get('/v1/web-dashboard/listings')
        setListings(data)
      } catch (err) {
        console.error('Failed to load listings', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchListings()
  }, [])

  const platformStats = useMemo(() => getPlatformStats(listings), [listings])
  const activeCount = listings.filter((listing) => listing.status === 'Active').length
  const scheduledCount = listings.filter((listing) => listing.status === 'Scheduled').length
  const endedCount = listings.filter((listing) => listing.status === 'Ended').length
  const totalWatchers = listings.reduce((sum, listing) => sum + listing.watchers, 0)
  const totalOffers = listings.reduce((sum, listing) => sum + listing.offers, 0)
  const agingListings = listings.filter((listing) => listing.daysListed >= 10)
  const totalViews = listings.reduce((sum, listing) => sum + listing.views, 0)
  const watcherRate = totalViews > 0 ? Math.round((totalWatchers / totalViews) * 100) : 0

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiClient.put(`/v1/web-dashboard/listings/${id}/status`, { status })
      setListings((current) => current.map((listing) => listing.id === id ? { ...listing, status } : listing))
    } catch (err) {
      console.error('Failed to update status', err)
    }
  }

  return (
    <Shell>
      <div className="space-y-6">
        <ListingsHeader />

        <ListingsMetrics listings={listings} platformStats={platformStats} />

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-6">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-[#252525] bg-[#0D0D0D]">
                <span className="text-sm text-zinc-400 font-medium">Loading listings...</span>
              </div>
            ) : (
              <ActiveListingsTable listings={listings} onStatusChange={updateStatus} />
            )}
          </div>

          <div className="space-y-6">
            <PlatformPerformance platformStats={platformStats} />

            <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Attention Required</h2>
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-[#252525] bg-[#141414] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                      <Tag className="h-4 w-4 text-[#E8001C]" />
                      Active coverage
                    </div>
                    <span className="font-mono text-sm font-bold text-white">
                      {activeCount}/{listings.length}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#252525]">
                    <div
                      className="h-full rounded-full bg-[#E8001C]"
                      style={{ width: `${listings.length ? Math.round((activeCount / listings.length) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#252525] bg-[#141414] p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      Scheduled
                    </div>
                    <div className="mt-2 font-mono text-2xl font-bold text-white">{scheduledCount}</div>
                  </div>
                  <div className="rounded-xl border border-[#252525] bg-[#141414] p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                      <Eye className="h-3.5 w-3.5 text-blue-400" />
                      Open Offers
                    </div>
                    <div className="mt-2 font-mono text-2xl font-bold text-white">{totalOffers}</div>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/15 p-4">
                  <div className="flex items-center gap-2 font-semibold text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    {agingListings.length} listings need price review
                  </div>
                  <p className="mt-2 text-sm text-zinc-300">
                    {totalOffers} open buyer offers pending response, {endedCount} ended listings, and {totalWatchers} watchers across live marketplaces.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}
