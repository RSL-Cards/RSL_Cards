'use client'

import { useEffect, useMemo, useState } from 'react'
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
        <ActiveListingsTable listings={listings} onStatusChange={updateStatus} />
        <PlatformPerformance platformStats={platformStats} />
      </div>
    </Shell>
  )
}
