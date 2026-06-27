'use client'

import { CalendarClock, LineChart, ReceiptText, Sparkles, Trash2, X } from 'lucide-react'
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

interface CardDetailModalProps {
  card: InventoryCard
  onClose: () => void
}

export default function CardDetailModal({
  card,
  onClose,
}: CardDetailModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4">
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm hover:border-gray-300 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isLoading && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            Loading latest card details...
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error instanceof Error ? error.message : 'Error loading details'}
          </div>
        )}

        <div className="mb-6 relative flex flex-col items-center justify-center">
          <div className="flex flex-col items-center text-center">

            {/* BIG IMAGE */}
            <div className="relative mb-4 h-80 w-56 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <Image
                src={detailedCard.image_url || '/placeholder.png'}
                alt={detailedCard.player_name}
                fill
                className="object-contain p-2"
              />
            </div>

            {/* NAME */}
            <h2 className="text-2xl font-bold text-gray-950">
              {detailedCard.player_name}
            </h2>

            {/* DETAILS */}
            <p className="mt-1 text-gray-500">
              {detailedCard.year} {detailedCard.set_name} - {formatGrade(detailedCard.grade_key)}
            </p>

            {/* TAGS */}
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <span className={detailedCard.status === 'listed' ? 'chip-success capitalize' : 'chip-blue capitalize'}>
                {detailedCard.status}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                {detailedCard.sport}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-500">Cost Basis</div>
            <div className="mt-1 font-mono text-xl font-bold text-gray-950">{formatCurrency(detailedCard.cost_basis)}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-500">Market Value</div>
            <div className="mt-1 font-mono text-xl font-bold text-gray-950">{formatCurrency(detailedCard.market_value)}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-500">Profit/Loss</div>
            <div className={`mt-1 font-mono text-xl font-bold ${detailedCard.unrealized_gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {detailedCard.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(detailedCard.unrealized_gain)}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-500">Days Held</div>
            <div className="mt-1 font-mono text-xl font-bold text-gray-950">{detailedCard.days_held}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Active Listings Table */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 font-semibold text-gray-950">
              <ReceiptText className="h-4 w-4 text-blue-600" />
              Active Listings
            </div>
            {activeListings.length > 0 ? (
              <div className="space-y-2">
                {activeListings.map((listing: any) => {
                  const href = listing.item_web_url || (listing.platform === 'ebay' && listing.platform_listing_id ? `https://www.ebay.com/itm/${listing.platform_listing_id}` : '#');
                  return (
                    <a key={listing.platform_listing_id || Math.random()} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm border-b border-gray-100 pb-2 hover:bg-gray-50 transition-colors rounded-md p-2">
                      {listing.image_url ? (
                        <img src={listing.image_url} alt="listing" className="h-10 w-10 rounded object-cover flex-shrink-0 bg-gray-100" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400">
                          <ReceiptText className="h-4 w-4" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{listing.title || 'Untitled Listing'}</div>
                        <div className="text-xs text-gray-500 capitalize">{listing.platform} &bull; {listing.status}</div>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="font-mono text-gray-900 font-bold">{formatCurrency(listing.list_price || listing.price)}</span>
                      </div>
                    </a>
                  )
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No active listings found.</div>
            )}
          </div>

          {/* Sold Comps Table */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 font-semibold text-gray-950">
              <CalendarClock className="h-4 w-4 text-green-600" />
              Recent Sold Comps
            </div>
            {soldComps.length > 0 ? (
              <div className="space-y-2">
                {soldComps.map((comp: any, idx: number) => {
                  const href = comp.platform === 'ebay' && comp.platform_listing_id ? `https://www.ebay.com/itm/${comp.platform_listing_id}` : '#';
                  return (
                    <a key={idx} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm border-b border-gray-100 pb-2 hover:bg-gray-50 transition-colors rounded-md p-2">
                      <div className="h-10 w-10 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400">
                        <CalendarClock className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{comp.title || 'Untitled Comp'}</div>
                        <div className="text-xs text-gray-500 capitalize">{comp.platform} &bull; {new Date(comp.sold_at || comp.soldAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="font-mono text-gray-900 font-bold">{formatCurrency(comp.sold_price || comp.price)}</span>
                      </div>
                    </a>
                  )
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No sold comps found.</div>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold text-gray-950">
              <Sparkles className="h-4 w-4 text-blue-600" />
              AI Narrative
            </div>
            <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-600 shadow-sm">
              {detailedCard.days_held > 60 || detailedCard.unrealized_gain < 0 ? 'REVIEW' : 'HOLD'}
            </span>
          </div>
          <p className="text-sm leading-6 text-gray-600">{aiNarrative}</p>
        </div>
      </div>
    </div>
  )
}
