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
