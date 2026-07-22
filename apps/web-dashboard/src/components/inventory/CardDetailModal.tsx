'use client'

import { useState } from 'react'
import { CalendarClock, LineChart, ReceiptText, Sparkles, Trash2, X, Tag, DollarSign } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  formatCurrency,
  formatGrade,
  InventoryCard,
  platformOptions,
} from './inventoryUtils'
import Image from 'next/image'
import { useDashboardInventoryItemDetails } from '@/hooks/dashboard/useDashboard'
import ListingModal from '@/components/listings/ListingModal'
import QuickSaleModal from './QuickSaleModal'

interface CardDetailModalProps {
  card: InventoryCard
  onClose: () => void
}

export default function CardDetailModal({
  card,
  onClose,
}: CardDetailModalProps) {
  const [showListingModal, setShowListingModal] = useState(false)
  const [showQuickSaleModal, setShowQuickSaleModal] = useState(false)
  const { data, isLoading, error } = useDashboardInventoryItemDetails(card.id)

  const detailedCard = data?.item || card
  const activeListings = data?.activeListings || []
  const soldComps = data?.soldComps || []

  const priceTrendData = Array.from({ length: 12 }, (_, index) => {
    const progress = index / 11
    const start = Math.max(1, detailedCard.cost_basis || detailedCard.market_value)
    const price = Math.round(start + (detailedCard.market_value - start) * progress)

    return {
      date: `P${index + 1}`,
      price,
    }
  })
  
  const aiNarrative = `${detailedCard.player_name} is currently valued at ${formatCurrency(detailedCard.market_value)}, with a recorded cost basis of ${formatCurrency(detailedCard.cost_basis)} and ${detailedCard.unrealized_gain >= 0 ? 'an unrealized gain' : 'an unrealized loss'} of ${formatCurrency(Math.abs(detailedCard.unrealized_gain))}. ${detailedCard.days_held > 60 ? 'This card is aging in inventory, so listing or repricing should be reviewed.' : 'Holding period is still manageable, so monitor revaluation before making a pricing move.'}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-2xl">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#252525] bg-[#141414] text-zinc-400 hover:text-white shadow-sm transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isLoading && (
          <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/15 px-4 py-3 text-sm font-medium text-blue-400">
            Loading latest card details...
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/15 px-4 py-3 text-sm font-medium text-red-400">
            {error instanceof Error ? error.message : 'Error loading details'}
          </div>
        )}

        <div className="mb-6 relative flex flex-col items-center justify-center">
          <div className="flex flex-col items-center text-center">

            {/* BIG IMAGE */}
            <div className="relative mb-4 h-80 w-56 overflow-hidden rounded-xl border border-[#252525] bg-[#141414]">
              <Image
                src={detailedCard.image_url || '/placeholder.png'}
                alt={detailedCard.player_name}
                fill
                className="object-contain p-2"
              />
            </div>

            {/* NAME */}
            <h2 className="text-2xl font-bold text-white">
              {detailedCard.player_name}
            </h2>

            {/* DETAILS */}
            <p className="mt-1 text-zinc-400">
              {detailedCard.year} {detailedCard.set_name} - {formatGrade(detailedCard.grade_key)}
            </p>

            {/* TAGS */}
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <span className={detailedCard.status === 'listed' ? 'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border capitalize bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border capitalize bg-blue-500/15 text-blue-400 border-blue-500/30'}>
                {detailedCard.status}
              </span>
              <span className="rounded-full bg-[#141414] border border-[#252525] px-2.5 py-1 text-xs text-zinc-300">
                {detailedCard.sport}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-[#252525] bg-[#141414] p-4">
            <div className="text-sm text-zinc-400">Cost Basis</div>
            <div className="mt-1 font-mono text-xl font-bold text-white">{formatCurrency(detailedCard.cost_basis)}</div>
          </div>
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/15 p-4">
            <div className="text-sm text-blue-400 font-semibold">Your Target Price</div>
            <div className="mt-1 font-mono text-xl font-bold text-white">{formatCurrency(detailedCard.market_value)}</div>
          </div>
          <div className="rounded-lg border border-[#252525] bg-[#141414] p-4">
            <div className="text-sm text-zinc-400">Profit/Loss</div>
            <div className={`mt-1 font-mono text-xl font-bold ${detailedCard.unrealized_gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {detailedCard.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(detailedCard.unrealized_gain)}
            </div>
          </div>
          <div className="rounded-lg border border-[#252525] bg-[#141414] p-4">
            <div className="text-sm text-zinc-400">Days Held</div>
            <div className="mt-1 font-mono text-xl font-bold text-white">{detailedCard.days_held} days</div>
          </div>
        </div>

        {/* Clear Analysis / Comps Grid */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-[#252525] bg-[#141414] p-4">
            <div className="text-sm text-zinc-400">Comp Average</div>
            <div className="mt-1 font-mono text-xl font-bold text-white">
              {detailedCard.comp_avg ? formatCurrency(detailedCard.comp_avg) : 'N/A'}
            </div>
          </div>
          <div className="rounded-lg border border-[#252525] bg-[#141414] p-4">
            <div className="text-sm text-zinc-400">Live Active Range</div>
            <div className="mt-1 font-mono text-xl font-bold text-white">
              {detailedCard.lowest_active && detailedCard.highest_active 
                ? `${formatCurrency(detailedCard.lowest_active)} - ${formatCurrency(detailedCard.highest_active)}` 
                : detailedCard.lowest_active 
                  ? `${formatCurrency(detailedCard.lowest_active)}+` 
                  : 'N/A'}
            </div>
          </div>
          <div className="rounded-lg border border-[#252525] bg-[#141414] p-4">
            <div className="text-sm text-zinc-400">Sold Range (30D)</div>
            <div className="mt-1 font-mono text-xl font-bold text-white">
              {detailedCard.lowest_sold && detailedCard.highest_sold 
                ? `${formatCurrency(detailedCard.lowest_sold)} - ${formatCurrency(detailedCard.highest_sold)}` 
                : detailedCard.lowest_sold 
                  ? `${formatCurrency(detailedCard.lowest_sold)}+` 
                  : 'N/A'}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Active Listings Table */}
          <div className="rounded-lg border border-[#252525] bg-[#141414] p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 font-semibold text-white">
              <ReceiptText className="h-4 w-4 text-blue-400" />
              Active Listings
            </div>
            {activeListings.length > 0 ? (
              <div className="space-y-2">
                {activeListings.map((listing: any) => {
                  const href = listing.item_web_url || (listing.platform === 'ebay' && listing.platform_listing_id ? `https://www.ebay.com/itm/${listing.platform_listing_id}` : '#');
                  return (
                    <a key={listing.platform_listing_id || Math.random()} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm border-b border-[#252525] pb-2 hover:bg-[#1A1A1A] transition-colors rounded-md p-2">
                      {listing.image_url ? (
                        <img src={listing.image_url} alt="listing" className="h-10 w-10 rounded object-cover flex-shrink-0 bg-[#0D0D0D]" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-[#0D0D0D] flex-shrink-0 flex items-center justify-center text-zinc-500">
                          <ReceiptText className="h-4 w-4" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{listing.title || 'Untitled Listing'}</div>
                        <div className="text-xs text-zinc-400 capitalize">{listing.platform} &bull; {listing.status}</div>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="font-mono text-white font-bold">{formatCurrency(listing.list_price || listing.price)}</span>
                      </div>
                    </a>
                  )
                })}
              </div>
            ) : (
              <div className="text-sm text-zinc-400">No active listings found.</div>
            )}
          </div>

          {/* Sold Comps Table */}
          <div className="rounded-lg border border-[#252525] bg-[#141414] p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 font-semibold text-white">
              <CalendarClock className="h-4 w-4 text-emerald-400" />
              Recent Sold Comps
            </div>
            {soldComps.length > 0 ? (
              <div className="space-y-2">
                {soldComps.map((comp: any, idx: number) => {
                  const href = comp.platform === 'ebay' && comp.platform_listing_id ? `https://www.ebay.com/itm/${comp.platform_listing_id}` : '#';
                  return (
                    <a key={idx} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm border-b border-[#252525] pb-2 hover:bg-[#1A1A1A] transition-colors rounded-md p-2">
                      <div className="h-10 w-10 rounded bg-[#0D0D0D] flex-shrink-0 flex items-center justify-center text-zinc-500">
                        <CalendarClock className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{comp.title || 'Untitled Comp'}</div>
                        <div className="text-xs text-zinc-400 capitalize">{comp.platform} &bull; {new Date(comp.sold_at || comp.soldAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="font-mono text-white font-bold">{formatCurrency(comp.sold_price || comp.price)}</span>
                      </div>
                    </a>
                  )
                })}
              </div>
            ) : (
              <div className="text-sm text-zinc-400">No sold comps found.</div>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Sparkles className="h-4 w-4 text-blue-400" />
              RSL Narrative
            </div>
            <span className="rounded-full bg-[#141414] border border-[#252525] px-2 py-1 text-xs font-medium text-zinc-300 shadow-sm">
              {detailedCard.days_held > 60 || detailedCard.unrealized_gain < 0 ? 'REVIEW' : 'HOLD'}
            </span>
          </div>
          <p className="text-sm leading-6 text-zinc-300">{aiNarrative}</p>
        </div>

        {/* Bottom Actions Bar (Parity with Dealer Mobile App) */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#252525] pt-5">
          <div className="text-xs font-medium text-zinc-400">
            Manage inventory status across marketplaces &amp; sales channels
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setShowListingModal(true)}
              disabled={detailedCard.status === 'listed'}
              className={`inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                detailedCard.status === 'listed'
                  ? 'border border-[#252525] bg-[#141414] text-zinc-500 cursor-not-allowed opacity-70'
                  : 'border border-[#252525] bg-[#141414] text-white hover:bg-[#1A1A1A] shadow-sm'
              }`}
            >
              <Tag className="h-4 w-4 shrink-0 text-zinc-400" />
              <span>{detailedCard.status === 'listed' ? 'Listed' : 'Put Listing'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowQuickSaleModal(true)}
              className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-[#E8001C] hover:bg-[#CC0018] px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all"
            >
              <DollarSign className="h-4 w-4 shrink-0" />
              <span>Quick Sale</span>
            </button>
          </div>
        </div>
      </div>

      {showListingModal && (
        <ListingModal
          selectedCards={[detailedCard]}
          onClose={() => setShowListingModal(false)}
        />
      )}

      {showQuickSaleModal && (
        <QuickSaleModal
          card={detailedCard}
          onClose={() => setShowQuickSaleModal(false)}
          onSuccess={() => {
            setShowQuickSaleModal(false);
            onClose();
          }}
        />
      )}
    </div>
  )
}
