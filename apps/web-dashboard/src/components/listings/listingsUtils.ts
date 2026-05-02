export interface ActiveListing {
  id: string
  card: string
  platform: string
  price: number
  views: number
  watchers: number
  offers: number
  daysListed: number
  status: string
  net: number
  scheduleAt?: string
}

export interface ListingPlatformStat {
  platform: string
  count: number
  views: number
  net: number
}

export const activeListingsStorageKey = 'rsl_active_listings'

export const fallbackListings: ActiveListing[] = [
  { id: 'seed-1', card: '2023 CJ Stroud Prizm Silver PSA 10', platform: 'eBay', price: 190, views: 248, watchers: 31, offers: 4, daysListed: 6, status: 'Active', net: 159.83 },
  { id: 'seed-2', card: '2018 Luka Doncic Prizm Silver PSA 10', platform: 'Shopify', price: 540, views: 96, watchers: 12, offers: 1, daysListed: 2, status: 'Active', net: 524.04 },
  { id: 'seed-3', card: '2011 Mike Trout Topps Update PSA 9', platform: 'COMC', price: 155, views: 143, watchers: 18, offers: 2, daysListed: 14, status: 'Active', net: 124 },
]

export const getPlatformStats = (listings: ActiveListing[]): ListingPlatformStat[] => {
  const grouped = listings.reduce<Record<string, ListingPlatformStat>>((acc, listing) => {
    acc[listing.platform] ??= { platform: listing.platform, count: 0, views: 0, net: 0 }
    acc[listing.platform].count += 1
    acc[listing.platform].views += listing.views
    acc[listing.platform].net += listing.net
    return acc
  }, {})

  return Object.values(grouped)
}
