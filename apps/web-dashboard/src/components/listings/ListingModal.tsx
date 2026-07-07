'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { InventoryCard, formatCurrency, formatGrade } from '@/components/inventory/inventoryUtils'
import { CheckCircle2, Clock, Copy, ImagePlus, Sparkles, X } from 'lucide-react'

interface ListingModalProps {
  selectedCards: InventoryCard[]
  onClose: () => void
}

type PricingMode = 'same' | 'custom' | 'auto'
type ScheduleMode = 'now' | 'scheduled' | 'optimal'

const listingPlatforms = [
  { platform: 'eBay', feePct: 13.25, fixedFee: 0, shipping: 5, integration: 'eBay Inventory API', handles: 'Full auto-listing, comps, title gen, item specifics, photo upload, sale detection' },
  { platform: 'Whatnot', feePct: 9.5, fixedFee: 0.3, shipping: 5, integration: 'Whatnot API or manual assist', handles: 'Pre-fill data, schedule shows, track auction results' },
  { platform: 'COMC', feePct: 20, fixedFee: 0, shipping: 0, integration: 'API or CSV export', handles: 'Export as COMC-formatted CSV, track consignment' },
  { platform: 'Facebook Marketplace', feePct: 5, fixedFee: 0, shipping: 5, integration: 'Manual with pre-filled data', handles: 'Generate listing text and photos, copy to clipboard, open Facebook' },
  { platform: 'Mercari', feePct: 10, fixedFee: 0, shipping: 5, integration: 'API or manual assist', handles: 'Pre-fill data, generate description, track sales' },
  { platform: 'Goldin', feePct: 12, fixedFee: 0, shipping: 0, integration: 'Manual submission assist', handles: 'Pre-fill form, estimate auction value, track results' },
  { platform: 'MySlabs', feePct: 8, fixedFee: 0, shipping: 5, integration: 'API or manual', handles: 'Pre-fill listing, sync inventory' },
  { platform: 'TCGPlayer', feePct: 11.75, fixedFee: 0, shipping: 5, integration: 'TCGPlayer API', handles: 'Full auto-listing, price optimization' },
  { platform: 'Shopify', feePct: 2.9, fixedFee: 0.3, shipping: 0, integration: 'Shopify API', handles: 'Sync inventory, auto-update stock' },
  { platform: 'Instagram Shop', feePct: 5, fixedFee: 0, shipping: 5, integration: 'Product catalog feed', handles: 'Generate catalog from inventory' },
]

const storageKey = 'rsl_active_listings'

const platformMultiplier = (platform: string) => {
  const multipliers: Record<string, number> = {
    eBay: 1,
    Whatnot: 0.96,
    COMC: 0.92,
    'Facebook Marketplace': 0.98,
    Mercari: 0.95,
    Goldin: 1.12,
    MySlabs: 1.03,
    TCGPlayer: 0.97,
    Shopify: 1.05,
    'Instagram Shop': 1.01,
  }

  return multipliers[platform] ?? 1
}

export default function ListingModal({ selectedCards, onClose }: ListingModalProps) {
  const router = useRouter()
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(listingPlatforms.map((item) => item.platform))
  const [pricingMode, setPricingMode] = useState<PricingMode>('same')
  const [basePrice, setBasePrice] = useState(selectedCards[0]?.market_value?.toString() ?? '')
  const [customPrices, setCustomPrices] = useState<Record<string, string>>({})
  const [listingTitle, setListingTitle] = useState(
    selectedCards[0]
      ? `${selectedCards[0].year} ${selectedCards[0].player_name} ${selectedCards[0].set_name} ${formatGrade(selectedCards[0].grade_key)}`
      : ''
  )
  const [description, setDescription] = useState(
    selectedCards[0]
      ? `${selectedCards[0].player_name} ${selectedCards[0].set_name}. Grade: ${formatGrade(selectedCards[0].grade_key)}. Market comps are reviewed daily by RSL Cards.`
      : ''
  )
  const [specifics, setSpecifics] = useState(
    selectedCards[0]
      ? `Sport: ${selectedCards[0].sport}\nYear: ${selectedCards[0].year}\nSet: ${selectedCards[0].set_name}\nGrade: ${formatGrade(selectedCards[0].grade_key)}`
      : ''
  )
  const [photoNames, setPhotoNames] = useState<string[]>([])
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('now')
  const [scheduleAt, setScheduleAt] = useState('')
  const [publishMessage, setPublishMessage] = useState('')

  const primaryCard = selectedCards[0]

  const getPlatformPrice = useCallback((platform: string, card = primaryCard) => {
    const cardValue = card?.market_value ?? (Number(basePrice) || 0)

    if (pricingMode === 'custom') return Number(customPrices[platform] ?? basePrice) || 0
    if (pricingMode === 'auto') return Math.round(cardValue * platformMultiplier(platform))
    return Number(basePrice) || cardValue
  }, [basePrice, customPrices, pricingMode, primaryCard])

  const priceComparisonRows = useMemo(() => {
    return selectedCards.flatMap((card) =>
      listingPlatforms.map((platform) => {
        const suggestedPrice = Math.round(card.market_value * platformMultiplier(platform.platform))
        return {
          card,
          platform: platform.platform,
          lowestListing: Math.round(card.market_value * 0.92 * platformMultiplier(platform.platform)),
          avgSold: Math.round(card.comp_avg * platformMultiplier(platform.platform)),
          suggestedPrice,
        }
      })
    )
  }, [selectedCards])

  const feeRows = useMemo(() => {
    return listingPlatforms
      .filter((platform) => selectedPlatforms.includes(platform.platform))
      .map((platform) => {
        const price = getPlatformPrice(platform.platform)
        const fee = price * (platform.feePct / 100) + platform.fixedFee
        const net = price - fee - platform.shipping

        return {
          ...platform,
          price,
          fee,
          net,
        }
      })
  }, [getPlatformPrice, selectedPlatforms])

  const highestNet = feeRows.length > 0 ? Math.max(...feeRows.map((row) => row.net)) : 0

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform]
    )
  }

  const publishListings = () => {
    const listings = selectedCards.flatMap((card) =>
      selectedPlatforms.map((platform) => {
        const platformConfig = listingPlatforms.find((item) => item.platform === platform)!
        const price = getPlatformPrice(platform, card)
        const fee = price * (platformConfig.feePct / 100) + platformConfig.fixedFee

        return {
          id: `${card.id}-${platform}-${Date.now()}`,
          cardId: card.id,
          card: `${card.year} ${card.player_name} ${card.set_name} ${formatGrade(card.grade_key)}`,
          platform,
          price,
          views: Math.floor(40 + Math.random() * 260),
          watchers: Math.floor(3 + Math.random() * 38),
          offers: Math.floor(Math.random() * 7),
          daysListed: scheduleMode === 'now' ? 0 : 0,
          status: scheduleMode === 'now' ? 'Active' : 'Scheduled',
          net: price - fee - platformConfig.shipping,
          title: listingTitle,
          description,
          specifics,
          photos: photoNames,
          scheduleMode,
          scheduleAt: scheduleMode === 'scheduled' ? scheduleAt : scheduleMode === 'optimal' ? 'RSL optimal window' : 'Now',
        }
      })
    )

    const existing = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]')
    window.localStorage.setItem(storageKey, JSON.stringify([...listings, ...existing]))
    console.log({
      selectedCards,
      selectedPlatforms,
      price: Number(basePrice) || primaryCard?.market_value || 0,
      listings,
    })
    setPublishMessage(`${listings.length} listings published. Opening Listings page...`)
    window.setTimeout(() => router.push('/Listings'), 500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[92vh] w-full max-w-7xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Listing Creation Flow</h2>
            <p className="mt-1 text-sm text-text-secondary">Publish selected inventory across marketplaces with synced pricing, content, photos, and schedule.</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary hover:border-white hover:text-white" aria-label="Close listing modal">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <section className="rounded-lg border border-border bg-white/5 p-4">
            <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">Selected Cards</div>
            <div className="max-h-64 space-y-3 overflow-y-auto">
              {selectedCards.length > 0 ? selectedCards.map((card) => (
                <div key={card.id} className="flex items-center justify-between gap-3 rounded-lg bg-surface/80 p-3">
                  <div>
                    <div className="font-semibold text-white">{card.player_name}</div>
                    <div className="text-xs text-text-muted">{card.year} {card.set_name} - {formatGrade(card.grade_key)}</div>
                  </div>
                  <div className="font-mono text-sm text-white">{formatCurrency(card.market_value)}</div>
                </div>
              )) : (
                <div className="rounded-lg border border-border bg-surface/80 p-4 text-sm text-text-secondary">Select one or more cards in Inventory first.</div>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-white/5 p-4 xl:col-span-2">
            <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">Choose Platforms</div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {listingPlatforms.map((platform) => (
                <label key={platform.platform} className="flex cursor-pointer items-start justify-between gap-3 rounded-lg bg-surface/80 p-3 hover:bg-white/10">
                  <span>
                    <span className="block font-medium text-white">{platform.platform}</span>
                    <span className="text-xs text-text-muted">{platform.integration} - {platform.feePct}% fee</span>
                  </span>
                  <input type="checkbox" checked={selectedPlatforms.includes(platform.platform)} onChange={() => togglePlatform(platform.platform)} className="mt-1 h-4 w-4 accent-accent-blue" />
                </label>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-4 rounded-lg border border-border bg-white/5 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Price Comparison Engine</div>
              <div className="mt-1 text-sm text-text-muted">Lowest listing, average sold, and suggested price per platform.</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['same', 'custom', 'auto'] as PricingMode[]).map((mode) => (
                <button key={mode} type="button" onClick={() => setPricingMode(mode)} className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize ${pricingMode === mode ? 'bg-accent-blue text-white' : 'bg-surface-2 text-text-secondary hover:text-white'}`}>
                  {mode === 'same' ? 'Same All' : mode === 'custom' ? 'Custom' : 'Auto Optimize'}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
            <input type="number" min="0" value={basePrice} onChange={(event) => setBasePrice(event.target.value)} className="dashboard-input" placeholder="Base price" />
            {pricingMode === 'custom' && selectedPlatforms.slice(0, 3).map((platform) => (
              <input key={platform} type="number" min="0" value={customPrices[platform] ?? ''} onChange={(event) => setCustomPrices((current) => ({ ...current, [platform]: event.target.value }))} className="dashboard-input" placeholder={`${platform} price`} />
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr>
                  {['Card', 'Platform', 'Lowest Listing', 'Avg Sold', 'Suggested'].map((heading) => (
                    <th key={heading} className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {priceComparisonRows.slice(0, 20).map((row) => (
                  <tr key={`${row.card.id}-${row.platform}`}>
                    <td className="py-3 text-sm font-semibold text-white">{row.card.player_name}</td>
                    <td className="py-3 text-sm text-text-secondary">{row.platform}</td>
                    <td className="py-3 font-mono text-white">{formatCurrency(row.lowestListing)}</td>
                    <td className="py-3 font-mono text-white">{formatCurrency(row.avgSold)}</td>
                    <td className="py-3 font-mono font-semibold text-success">{formatCurrency(row.suggestedPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-4 rounded-lg border border-border bg-white/5 p-4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Fee Calculator</div>
              <div className="mt-1 text-sm text-text-muted">Best net profit platform is highlighted green.</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr>
                  {['Platform', 'Price', 'Fee', 'Shipping', 'Est. Net', 'RSL Cards Handles'].map((heading) => (
                    <th key={heading} className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {feeRows.map((row) => {
                  const isBest = row.net === highestNet
                  return (
                    <tr key={row.platform} className={isBest ? 'bg-success/10' : ''}>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{row.platform}</span>
                          {isBest && <span className="rounded-full bg-success/20 px-2 py-1 text-xs font-semibold text-success">Best Platform</span>}
                        </div>
                      </td>
                      <td className="py-3 font-mono text-white">{formatCurrency(row.price)}</td>
                      <td className="py-3 font-mono text-accent-red">-{formatCurrency(row.fee)}</td>
                      <td className="py-3 font-mono text-text-secondary">{row.shipping ? `-${formatCurrency(row.shipping)}` : 'Included'}</td>
                      <td className="py-3 font-mono font-semibold text-success">{formatCurrency(row.net)}</td>
                      <td className="py-3 text-sm text-text-secondary">{row.handles}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="rounded-lg border border-border bg-white/5 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-text-secondary">
              <Sparkles className="h-4 w-4 text-warning" />
              Generated Listing Content
            </div>
            <input value={listingTitle} onChange={(event) => setListingTitle(event.target.value)} className="dashboard-input mb-3 w-full" placeholder="Listing title" />
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="dashboard-input mb-3 min-h-28 w-full" placeholder="Description" />
            <textarea value={specifics} onChange={(event) => setSpecifics(event.target.value)} className="dashboard-input min-h-24 w-full font-mono text-sm" placeholder="Item specifics" />
            <button type="button" onClick={() => navigator.clipboard?.writeText(`${listingTitle}\n\n${description}\n\n${specifics}`)} className="btn-outline mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
              <Copy className="h-4 w-4" />
              Copy Listing Text
            </button>
          </section>

          <section className="rounded-lg border border-border bg-white/5 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-text-secondary">
              <ImagePlus className="h-4 w-4 text-accent-blue" />
              Photos & Schedule
            </div>
            <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-border bg-black/20 p-6 text-center hover:border-accent-blue">
              <span>
                <span className="block font-semibold text-white">Attach photos</span>
                <span className="text-sm text-text-muted">{photoNames.length ? photoNames.join(', ') : 'Upload listing images'}</span>
              </span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={(event) => setPhotoNames(Array.from(event.target.files ?? []).map((file) => file.name))} />
            </label>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {(['now', 'scheduled', 'optimal'] as ScheduleMode[]).map((mode) => (
                <button key={mode} type="button" onClick={() => setScheduleMode(mode)} className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize ${scheduleMode === mode ? 'bg-accent-blue text-white' : 'bg-surface-2 text-text-secondary hover:text-white'}`}>
                  {mode === 'now' ? 'Post Now' : mode === 'scheduled' ? 'Schedule' : 'Optimal Time'}
                </button>
              ))}
            </div>
            {scheduleMode === 'scheduled' && (
              <input type="datetime-local" value={scheduleAt} onChange={(event) => setScheduleAt(event.target.value)} className="dashboard-input mt-3 w-full" />
            )}
            {scheduleMode === 'optimal' && (
              <div className="mt-3 rounded-lg border border-success/20 bg-success/10 p-3 text-sm text-success">
                RSL recommends tonight at 8:30 PM based on watcher activity.
              </div>
            )}
          </section>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Clock className="h-4 w-4" />
            Inventory will sync across selected platforms to prevent double-selling.
          </div>
          <button type="button" onClick={publishListings} disabled={selectedPlatforms.length === 0 || selectedCards.length === 0} className="btn-primary inline-flex items-center justify-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">
            <CheckCircle2 className="h-4 w-4" />
            Publish on {selectedPlatforms.length} Platforms
          </button>
        </div>

        {publishMessage && (
          <div className="mt-4 rounded-lg border border-success/20 bg-success/10 p-3 text-sm font-medium text-success">{publishMessage}</div>
        )}
      </div>
    </div>
  )
}
