'use client'

import { useState, useMemo } from 'react'
import { CalendarClock, LineChart, ReceiptText, Sparkles, X, Tag, DollarSign, Layers, ExternalLink, AlertCircle } from 'lucide-react'
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
  GRADE_CONFIG,
  InventoryCard,
} from './inventoryUtils'
import Image from 'next/image'
import { useDashboardInventoryItemDetails } from '@/hooks/dashboard/useDashboard'
import ListingModal from '@/components/listings/ListingModal'
import QuickSaleModal from './QuickSaleModal'

interface CardDetailModalProps {
  card: InventoryCard
  onClose: () => void
}

function getListingUrl(item: any): string {
  if (!item) return '#'
  if (item.item_web_url) return item.item_web_url
  if (item.itemWebUrl) return item.itemWebUrl
  if (item.url) return item.url

  const id = item.platform_listing_id || item.platform_item_id || item.itemId || item.id
  const platform = String(item.platform || '').toLowerCase()

  if (id) {
    if (platform === 'ebay') return `https://www.ebay.com/itm/${id}`
    if (platform === 'myslabs') return `https://myslabs.com/slab/view/${id}`
  }

  const title = item.title || item.name || ''
  if (title) {
    if (platform === 'myslabs') {
      return `https://myslabs.com/search/?q=${encodeURIComponent(title)}`
    }
    return `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(title)}`
  }

  return '#'
}

const gradesList = [
  "RAW",
  "5",
  "6",
  "7",
  "8",
  "9",
  "9.5",
  "10",
]

function calcMedian(prices: number[]): number {
  if (!prices.length) return 0
  const sorted = [...prices].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

// Client-side comps filtering by exact grade matching mobile app logic
function filterCompsByGrade(items: any[], selectedGrade: string): any[] {
  if (!items || !items.length) return []
  return items.filter(item => {
    const title = (item.title || item.name || "").toUpperCase()
    const condition = (item.condition || "").toUpperCase()

    const isUngradedCondition = condition === "UNGRADED" || condition === "RAW"
    const isGradedCondition = condition === "GRADED" || condition === "SLABBED" || condition === "SLAB"

    const itemGrade = item.grade_key || item.gradeKey || ""
    if (itemGrade) {
      let parsedGrade = "RAW"
      if (itemGrade !== "RAW") {
        const numMatch = itemGrade.match(/_(\d+(?:\.\d+)?)$/)
        parsedGrade = numMatch ? numMatch[1] : (/^\d+(?:\.\d+)?$/.test(itemGrade) ? itemGrade : "RAW")
      }
      if (parsedGrade === selectedGrade) {
        if (selectedGrade !== "RAW" && isUngradedCondition) return false
        return true
      }
      return false
    }

    if (selectedGrade === "RAW") {
      if (isGradedCondition) return false
      return !/\b(PSA|BGS|SGC|CGC|CSG|BECKETT|GRADED|SLAB|SLABBED)\b/i.test(title)
    } else {
      if (isUngradedCondition) return false

      if (/\b(READY|RAW|LOT|NOT\s+(?:PSA|BGS|SGC|CGC|CSG)|PSA\s*\?|\?\s*PSA)\b/i.test(title)) {
        return false
      }

      const hasGradingCompany = /\b(PSA|BGS|SGC|CGC|CSG|BECKETT|GRADED|SLAB|SLABBED)\b/i.test(title)
      if (!hasGradingCompany) return false

      if (selectedGrade === "9") {
        return /\b9\b/.test(title) && !/\b9\.5\b/.test(title)
      } else if (selectedGrade === "9.5") {
        return /\b9\.5\b/.test(title)
      } else if (selectedGrade === "10") {
        return /\b10\b/.test(title)
      } else {
        const escapedGrade = selectedGrade.replace(".", "\\.")
        const gradeRegex = new RegExp(`\\b${escapedGrade}\\b`)
        return gradeRegex.test(title)
      }
    }
  })
}

export default function CardDetailModal({
  card,
  onClose,
}: CardDetailModalProps) {
  const [showListingModal, setShowListingModal] = useState(false)
  const [showQuickSaleModal, setShowQuickSaleModal] = useState(false)
  
  // Grade Selection state — initialized to card's exact numeric grade (matches mobile app)
  const initialGradeKey = useMemo(() => {
    if (!card.grade_key || card.grade_key === 'RAW') return 'RAW'
    const numMatch = card.grade_key.match(/[\d\.]+/)
    return numMatch ? numMatch[0] : 'RAW'
  }, [card.grade_key])

  const [selectedGradeKey, setSelectedGradeKey] = useState<string>(initialGradeKey)
  const [timeRange, setTimeRange] = useState<'30D' | '90D' | '1Y' | 'ALL'>('30D')

  const { data, isLoading, error } = useDashboardInventoryItemDetails(card.id)

  const detailedCard = data?.item || card
  const activeListings = data?.activeListings || []
  const soldComps = data?.soldComps || []

  // Combine raw comps from DB if available
  const rawEbaySales = useMemo(() => {
    if (detailedCard.ebay_sales_completed) {
      try { return JSON.parse(detailedCard.ebay_sales_completed) } catch (e) {}
    }
    return soldComps.filter((s: any) => !s.platform || s.platform.toLowerCase() === 'ebay')
  }, [detailedCard.ebay_sales_completed, soldComps])

  const rawMyslabsSales = useMemo(() => {
    if (detailedCard.myslabs_sales_completed) {
      try { return JSON.parse(detailedCard.myslabs_sales_completed) } catch (e) {}
    }
    return soldComps.filter((s: any) => s.platform && s.platform.toLowerCase() === 'myslabs')
  }, [detailedCard.myslabs_sales_completed, soldComps])

  const rawEbayActive = useMemo(() => {
    if (detailedCard.ebay_active_listings) {
      try { return JSON.parse(detailedCard.ebay_active_listings) } catch (e) {}
    }
    return activeListings.filter((a: any) => !a.platform || a.platform.toLowerCase() === 'ebay')
  }, [detailedCard.ebay_active_listings, activeListings])

  const rawMyslabsActive = useMemo(() => {
    if (detailedCard.myslabs_active_listings) {
      try { return JSON.parse(detailedCard.myslabs_active_listings) } catch (e) {}
    }
    return activeListings.filter((a: any) => a.platform && a.platform.toLowerCase() === 'myslabs')
  }, [detailedCard.myslabs_active_listings, activeListings])

  const filteredEbaySold = useMemo(() => filterCompsByGrade(rawEbaySales, selectedGradeKey), [rawEbaySales, selectedGradeKey])
  const filteredMyslabsSold = useMemo(() => filterCompsByGrade(rawMyslabsSales, selectedGradeKey), [rawMyslabsSales, selectedGradeKey])
  const filteredEbayActive = useMemo(() => filterCompsByGrade(rawEbayActive, selectedGradeKey), [rawEbayActive, selectedGradeKey])
  const filteredMyslabsActive = useMemo(() => filterCompsByGrade(rawMyslabsActive, selectedGradeKey), [rawMyslabsActive, selectedGradeKey])

  const allFilteredSoldComps = useMemo(() => {
    return [...filteredEbaySold, ...filteredMyslabsSold].sort((a: any, b: any) => {
      const da = new Date(a.sold_at || a.soldAt || a.endDate || 0).getTime()
      const db = new Date(b.sold_at || b.soldAt || b.endDate || 0).getTime()
      return db - da
    })
  }, [filteredEbaySold, filteredMyslabsSold])

  const allFilteredActiveComps = useMemo(() => {
    return [...filteredEbayActive, ...filteredMyslabsActive].sort((a: any, b: any) => {
      const pa = Number(a.list_price || a.price?.value || a.price || 0)
      const pb = Number(b.list_price || b.price?.value || b.price || 0)
      return pa - pb
    })
  }, [filteredEbayActive, filteredMyslabsActive])

  // Selected Grade Metrics (Strictly 0 if no comps for this selected grade!)
  const gradePrices = useMemo(() => {
    return allFilteredSoldComps.map((s: any) => Number(s.sold_price || s.soldPrice?.value || s.price || 0)).filter(p => p > 0)
  }, [allFilteredSoldComps])

  const medianCompPrice = useMemo(() => {
    if (gradePrices.length > 0) return calcMedian(gradePrices)
    return 0
  }, [gradePrices])

  const gradeLowestActive = useMemo(() => {
    if (!allFilteredActiveComps.length) return 0
    const validPrices = allFilteredActiveComps.map((a: any) => Number(a.list_price || a.price?.value || a.price || 0)).filter(p => p > 0)
    return validPrices.length > 0 ? Math.min(...validPrices) : 0
  }, [allFilteredActiveComps])

  const gradeHighestActive = useMemo(() => {
    if (!allFilteredActiveComps.length) return 0
    const validPrices = allFilteredActiveComps.map((a: any) => Number(a.list_price || a.price?.value || a.price || 0)).filter(p => p > 0)
    return validPrices.length > 0 ? Math.max(...validPrices) : 0
  }, [allFilteredActiveComps])

  // Price Trend Chart Data dynamically calculated for selected grade
  const chartData = useMemo(() => {
    if (allFilteredSoldComps.length === 0) return []
    return [...allFilteredSoldComps].reverse().map((c: any, index: number) => {
      const d = c.sold_at || c.soldAt || c.endDate
      const dateStr = d ? new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric' }) : `Sale ${index + 1}`
      return {
        date: dateStr,
        price: Number(c.sold_price || c.soldPrice?.value || c.price || 0)
      }
    })
  }, [allFilteredSoldComps])

  const gradeLabel = selectedGradeKey === 'RAW' ? 'RAW' : `GRADE ${selectedGradeKey}`

  const gradeCfg = GRADE_CONFIG[detailedCard.grade_key] ?? {
    badgeStyle: 'bg-[#141414] text-zinc-400 border-[#252525] font-medium',
    label: formatGrade(detailedCard.grade_key),
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-[#252525] bg-[#0D0D0D] p-5 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 z-20 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#252525] bg-[#141414] text-zinc-400 hover:text-white hover:border-[#333] transition-colors shadow-sm"
        >
          <X className="h-4 w-4" />
        </button>

        {isLoading && (
          <div className="mb-4 rounded-xl border border-blue-500/30 bg-blue-500/15 px-4 py-3 text-xs font-semibold text-blue-400 animate-pulse">
            Loading latest card details &amp; comps data...
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-3 text-xs font-semibold text-red-400">
            {error instanceof Error ? error.message : 'Error loading details'}
          </div>
        )}

        {/* Header Hero Section */}
        <div className="mb-6 flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-[#252525] pb-6">
          {/* Card Image */}
          <div className="relative h-72 w-52 shrink-0 overflow-hidden rounded-2xl border border-[#252525] bg-[#141414] shadow-lg group">
            <Image
              src={detailedCard.image_url || '/placeholder.png'}
              alt={detailedCard.player_name}
              fill
              className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
            />
            {detailedCard.quantity && detailedCard.quantity > 1 ? (
              <span className="absolute top-3 right-3 rounded-lg bg-black/90 border border-white/20 px-2.5 py-1 font-mono text-xs font-bold text-white shadow-lg">
                &times;{detailedCard.quantity}
              </span>
            ) : null}
          </div>

          {/* Card Meta & Badges */}
          <div className="flex-1 text-center md:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-2">
              <span className={`inline-flex items-center rounded-lg border px-3 py-1 text-xs uppercase ${gradeCfg.badgeStyle}`}>
                {gradeCfg.label}
              </span>
              <span className={detailedCard.status === 'listed' ? 'inline-flex rounded-full px-3 py-1 text-xs font-bold border capitalize bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'inline-flex rounded-full px-3 py-1 text-xs font-bold border capitalize bg-blue-500/15 text-blue-400 border-blue-500/30'}>
                {detailedCard.status}
              </span>
              <span className="rounded-full bg-[#141414] border border-[#252525] px-3 py-1 text-xs font-semibold text-zinc-300">
                {detailedCard.sport}
              </span>
              {detailedCard.cert_number && (
                <span className="rounded-full bg-zinc-900 border border-zinc-700 px-3 py-1 text-xs font-mono text-zinc-400">
                  Cert #{detailedCard.cert_number}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {detailedCard.player_name}
            </h1>

            <p className="mt-1.5 text-base text-zinc-300 font-medium">
              {detailedCard.year ? `${detailedCard.year} ` : ''}{detailedCard.set_name}
              {detailedCard.variation ? <span className="text-zinc-400"> &bull; {detailedCard.variation}</span> : null}
              {detailedCard.card_number ? <span className="text-zinc-400"> &bull; #{detailedCard.card_number}</span> : null}
            </p>

            {/* Quick Metrics Cards */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-[#252525] bg-[#141414] p-3">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Cost Basis</span>
                <span className="font-mono text-lg font-bold text-white block mt-0.5">{formatCurrency(detailedCard.cost_basis)}</span>
              </div>
              <div className="rounded-xl border border-blue-500/40 bg-blue-500/15 p-3">
                <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider block">Target Market</span>
                <span className="font-mono text-lg font-bold text-white block mt-0.5">{formatCurrency(detailedCard.market_value)}</span>
              </div>
              <div className="rounded-xl border border-[#252525] bg-[#141414] p-3">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Unrealized P&amp;L</span>
                <span className={`font-mono text-lg font-bold block mt-0.5 ${detailedCard.unrealized_gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {detailedCard.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(detailedCard.unrealized_gain)}
                </span>
              </div>
              <div className="rounded-xl border border-[#252525] bg-[#141414] p-3">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Holding Time</span>
                <span className="font-mono text-lg font-bold text-white block mt-0.5">{detailedCard.days_held} days</span>
              </div>
            </div>

            {detailedCard.notes && (
              <p className="mt-3.5 text-xs text-zinc-400 italic bg-[#141414] px-4 py-2.5 rounded-xl border border-[#252525]">
                &ldquo;{detailedCard.notes}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* ─── GRADE SELECTOR TABS BAR ─────────────────────────────────── */}
        <div className="mb-6 rounded-2xl border border-[#252525] bg-[#141414] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                SELECT GRADE FOR MARKET DATA &amp; COMPS
              </h3>
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">
              Click a grade to view market comps &amp; graph
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {gradesList.map((item) => {
              const isSelected = selectedGradeKey === item
              const itemGradeNum = detailedCard.grade_key
                ? (detailedCard.grade_key === 'RAW' ? 'RAW' : (detailedCard.grade_key.match(/[\d\.]+/)?.[0] || null))
                : null
              const isItemGrade = itemGradeNum === item

              return (
                <button
                  key={item}
                  onClick={() => setSelectedGradeKey(item)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#E8001C] border-[#E8001C] text-white shadow-md'
                      : isItemGrade
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30'
                        : 'bg-[#0D0D0D] border-[#252525] text-zinc-400 hover:bg-[#1A1A1A] hover:text-white'
                  }`}
                >
                  <span>{item === 'RAW' ? 'RAW' : `GRADE ${item}`}</span>
                  {isItemGrade && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-black font-extrabold uppercase">
                      Current
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ─── INTERACTIVE PRICE TREND GRAPH (RECHARTS) ─────────────────────────────────── */}
        <div className="mb-6 rounded-2xl border border-[#252525] bg-[#141414] p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400">
                <LineChart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Price History &amp; Comps Trend ({gradeLabel})
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Median comp value:{' '}
                  <span className="font-mono font-bold text-emerald-400">
                    {medianCompPrice > 0 ? `$${medianCompPrice.toFixed(2)}` : 'N/A'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-[#0D0D0D] p-1 rounded-xl border border-[#252525] self-start sm:self-auto">
              {(['30D', '90D', '1Y', 'ALL'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                    timeRange === r ? 'bg-[#252525] text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E8001C" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#E8001C" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
                  <XAxis dataKey="date" stroke="#71717A" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717A" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-[#333] bg-[#0D0D0D] p-3 shadow-xl text-xs">
                            <p className="text-zinc-400 mb-1">{payload[0].payload.date}</p>
                            <p className="font-mono text-sm font-bold text-emerald-400">
                              ${Number(payload[0].value).toFixed(2)}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#E8001C"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#2D2D2D] bg-[#0D0D0D] p-6 text-center">
                <AlertCircle className="w-9 h-9 text-amber-500/80 mb-2" />
                <h5 className="text-sm font-bold text-white">No exact sales comps for {gradeLabel}</h5>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                  We do not have any cached verified sales comps for this grade.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─── SELECTED GRADE COMPS SUMMARY ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl border border-[#252525] bg-[#141414] p-4">
            <span className="text-xs font-semibold text-zinc-400 block mb-1">Median Comp Price</span>
            <span className="font-mono text-2xl font-extrabold text-emerald-400 block">
              {medianCompPrice > 0 ? formatCurrency(medianCompPrice) : 'N/A'}
            </span>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Based on {allFilteredSoldComps.length} verified sales
            </span>
          </div>

          <div className="rounded-2xl border border-[#252525] bg-[#141414] p-4">
            <span className="text-xs font-semibold text-zinc-400 block mb-1">Live Active Range</span>
            <span className="font-mono text-xl font-bold text-white block">
              {gradeLowestActive > 0 && gradeHighestActive > 0
                ? `${formatCurrency(gradeLowestActive)} - ${formatCurrency(gradeHighestActive)}`
                : gradeLowestActive > 0
                  ? `${formatCurrency(gradeLowestActive)}+`
                  : 'N/A'}
            </span>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              {allFilteredActiveComps.length} active listings for {gradeLabel}
            </span>
          </div>

          <div className="rounded-2xl border border-[#252525] bg-[#141414] p-4">
            <span className="text-xs font-semibold text-zinc-400 block mb-1">30D Sold Range</span>
            <span className="font-mono text-xl font-bold text-white block">
              {gradePrices.length > 0
                ? `${formatCurrency(Math.min(...gradePrices))} - ${formatCurrency(Math.max(...gradePrices))}`
                : 'N/A'}
            </span>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Historical comp range
            </span>
          </div>
        </div>

        {/* ─── COMPS LISTINGS TABS & MARKETPLACE TABLE ─────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
          {/* Active Listings Table */}
          <div className="rounded-2xl border border-[#252525] bg-[#141414] p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <ReceiptText className="h-4 w-4 text-blue-400" />
                Active Marketplace Listings
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                {allFilteredActiveComps.length} available
              </span>
            </div>

            {allFilteredActiveComps.length > 0 ? (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {allFilteredActiveComps.map((listing: any, idx: number) => {
                  const priceVal = Number(listing.list_price || listing.price?.value || listing.price || 0)
                  const href = getListingUrl(listing)
                  return (
                    <a
                      key={idx}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 text-xs border border-[#252525] bg-[#0D0D0D] hover:bg-[#1A1A1A] hover:border-blue-500/40 p-2.5 rounded-xl transition-all"
                    >
                      {listing.image_url ? (
                        <img src={listing.image_url} alt="listing" className="h-10 w-10 rounded-lg object-cover shrink-0 bg-[#141414]" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-[#141414] shrink-0 flex items-center justify-center text-zinc-500">
                          <ReceiptText className="h-4 w-4" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate flex items-center gap-1.5">
                          <span className="truncate">{listing.title || listing.name || 'Untitled Listing'}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <div className="text-[11px] text-zinc-400 capitalize mt-0.5">{listing.platform || 'eBay'} &bull; {listing.status || 'Active'}</div>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="font-mono text-sm text-white font-extrabold">{formatCurrency(priceVal)}</span>
                      </div>
                    </a>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-zinc-500 bg-[#0D0D0D] rounded-xl border border-[#252525]">
                No active listings found for {gradeLabel}.
              </div>
            )}
          </div>

          {/* Sold Comps Table */}
          <div className="rounded-2xl border border-[#252525] bg-[#141414] p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <CalendarClock className="h-4 w-4 text-emerald-400" />
                Verified Sold Comps
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                {allFilteredSoldComps.length} sales
              </span>
            </div>

            {allFilteredSoldComps.length > 0 ? (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {allFilteredSoldComps.map((comp: any, idx: number) => {
                  const priceVal = Number(comp.sold_price || comp.soldPrice?.value || comp.price || 0)
                  const href = getListingUrl(comp)
                  const d = comp.sold_at || comp.soldAt || comp.endDate
                  return (
                    <a
                      key={idx}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 text-xs border border-[#252525] bg-[#0D0D0D] hover:bg-[#1A1A1A] hover:border-emerald-500/40 p-2.5 rounded-xl transition-all"
                    >
                      <div className="h-10 w-10 rounded-lg bg-[#141414] shrink-0 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <CalendarClock className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors truncate flex items-center gap-1.5">
                          <span className="truncate">{comp.title || comp.name || 'Untitled Comp'}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                        </div>
                        <div className="text-[11px] text-zinc-400 capitalize mt-0.5">
                          {comp.platform || 'eBay'} &bull; {d ? new Date(d).toLocaleDateString() : 'Recent'}
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="font-mono text-sm text-emerald-400 font-extrabold">{formatCurrency(priceVal)}</span>
                      </div>
                    </a>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-zinc-500 bg-[#0D0D0D] rounded-xl border border-[#252525]">
                No verified sold comps found for {gradeLabel}.
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#252525] pt-5">
          <div className="text-xs font-medium text-zinc-400">
            Manage inventory status across marketplaces &amp; sales channels
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setShowListingModal(true)}
              disabled={detailedCard.status === 'listed'}
              className={`inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
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
              className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-[#E8001C] hover:bg-[#CC0018] px-6 py-2.5 text-xs font-extrabold text-white shadow-lg transition-all border border-[#E8001C]/50"
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
            setShowQuickSaleModal(false)
            onClose()
          }}
        />
      )}
    </div>
  )
}
