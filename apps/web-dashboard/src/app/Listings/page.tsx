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
  activeListingsStorageKey,
  fallbackListings,
  getPlatformStats,
} from '@/components/listings/listingsUtils'

export default function ListingsPage() {
  const [listings, setListings] = useState<ActiveListing[]>([])

  useEffect(() => {
    const stored = JSON.parse(window.localStorage.getItem(activeListingsStorageKey) ?? '[]') as ActiveListing[]
    setListings(stored.length ? stored : fallbackListings)
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

  const updateStatus = (id: string, status: string) => {
    setListings((current) => {
      const next = current.map((listing) => listing.id === id ? { ...listing, status } : listing)
      window.localStorage.setItem(activeListingsStorageKey, JSON.stringify(next))
      return next
    })
  }

  return (
    <Shell>
      <div className="space-y-6">
        <ListingsHeader />

        <ListingsMetrics listings={listings} platformStats={platformStats} />

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-6">
            <ActiveListingsTable listings={listings} onStatusChange={updateStatus} />
          </div>

          <div className="space-y-6">
            <PlatformPerformance platformStats={platformStats} />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Listing Health</h2>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Tag className="h-4 w-4 text-blue-600" />
                      Active coverage
                    </div>
                    <span className="font-mono text-sm font-bold text-gray-900">
                      {activeCount}/{listings.length}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${listings.length ? Math.round((activeCount / listings.length) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-200 bg-white p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      Scheduled
                    </div>
                    <div className="mt-2 font-mono text-2xl font-bold text-gray-900">{scheduledCount}</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                      <Eye className="h-3.5 w-3.5 text-blue-600" />
                      Watch rate
                    </div>
                    <div className="mt-2 font-mono text-2xl font-bold text-gray-900">{watcherRate}%</div>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 font-semibold text-amber-700">
                    <AlertTriangle className="h-4 w-4" />
                    {agingListings.length} listings need review
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {totalOffers} offers pending, {endedCount} ended listings, and {totalWatchers} total watchers across live marketplaces.
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
