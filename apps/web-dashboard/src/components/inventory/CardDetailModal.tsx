'use client'

import { useState, useMemo } from 'react'
import { CalendarClock, LineChart as LineChartIcon, ReceiptText, Sparkles, X, Tag, DollarSign, Layers, ExternalLink, AlertCircle, Camera, Pencil, Upload, Trash2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { inventoryService } from '@/services/inventoryService'
import { dashboardKeys } from '@/hooks/dashboard/useDashboard'
import ConfirmModal from '@/components/ui/ConfirmModal'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  formatCurrency,
  formatGrade,
  getGradeConfig,
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
  const queryClient = useQueryClient()
  const [showListingModal, setShowListingModal] = useState(false)
  const [showQuickSaleModal, setShowQuickSaleModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeletingCard, setIsDeletingCard] = useState(false)

  // Image Edit State
  const [showImageEditModal, setShowImageEditModal] = useState(false)
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [newImageUrl, setNewImageUrl] = useState(card.image_url || '')
  const [isUpdatingImage, setIsUpdatingImage] = useState(false)
  const [imageError, setImageError] = useState('')

  // Grade Edit State
  const [showGradeEditModal, setShowGradeEditModal] = useState(false)
  const [editGradeCompany, setEditGradeCompany] = useState(card.grade_company || 'PSA')
  const [editGradeValue, setEditGradeValue] = useState(card.grade_value || '10')
  const [isUpdatingGrade, setIsUpdatingGrade] = useState(false)
  const [gradeError, setGradeError] = useState('')

  // Metrics (Cost Basis & Target Market) Edit State
  const [showMetricsEditModal, setShowMetricsEditModal] = useState(false)
  const [editCostBasis, setEditCostBasis] = useState(String(card.cost_basis ?? 0))
  const [editMarketValue, setEditMarketValue] = useState(String(card.market_value ?? 0))
  const [isUpdatingMetrics, setIsUpdatingMetrics] = useState(false)
  const [metricsError, setMetricsError] = useState('')
  
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

  // Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFilePreview(URL.createObjectURL(file))
      setImageError('')
    }
  }

  const handleSaveImage = async () => {
    setIsUpdatingImage(true)
    setImageError('')
    try {
      if (imageMode === 'upload' && selectedFile) {
        await inventoryService.uploadPhotoDirect(card.id, selectedFile)
      } else if (newImageUrl.trim()) {
        await inventoryService.updateItem(card.id, {
          photos: [newImageUrl.trim()],
        })
      } else {
        setImageError('Please select a file or enter an image URL')
        setIsUpdatingImage(false)
        return
      }

      await queryClient.invalidateQueries({ queryKey: ['dashboard-item-details', card.id] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard-inventory'] })
      setShowImageEditModal(false)
      setSelectedFile(null)
      setFilePreview(null)
    } catch (err: any) {
      setImageError(err.message || 'Failed to update image')
    } finally {
      setIsUpdatingImage(false)
    }
  }

  const handleSaveGrade = async () => {
    setIsUpdatingGrade(true)
    setGradeError('')
    try {
      const company = editGradeCompany.toUpperCase().trim()
      const val = editGradeValue.trim()
      const key = company === 'RAW' || val === 'RAW' ? 'RAW' : `${company}_${val.replace('.', '')}`

      await inventoryService.updateItem(card.id, {
        gradeCompany: company,
        gradeValue: val,
        gradeKey: key,
      })

      const numMatch = val.match(/[\d\.]+/)
      if (numMatch && company !== 'RAW') {
        setSelectedGradeKey(numMatch[0])
      } else {
        setSelectedGradeKey('RAW')
      }

      await queryClient.invalidateQueries({ queryKey: ['dashboard-item-details', card.id] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard-inventory'] })
      setShowGradeEditModal(false)
    } catch (err: any) {
      setGradeError(err.message || 'Failed to update grade')
    } finally {
      setIsUpdatingGrade(false)
    }
  }

  const handleSaveMetrics = async () => {
    const cost = parseFloat(editCostBasis)
    const market = parseFloat(editMarketValue)
    if (isNaN(cost) || isNaN(market)) {
      setMetricsError('Please enter valid numerical values')
      return
    }

    setIsUpdatingMetrics(true)
    setMetricsError('')
    try {
      await inventoryService.updateItem(card.id, {
        costBasis: cost,
        currentMarketValue: market,
      })

      const newGain = market - cost

      // Optimistically update React Query details cache for instant UI refresh
      queryClient.setQueryData(['dashboard-item-details', card.id], (old: any) => {
        if (!old) return old
        return {
          ...old,
          item: {
            ...old.item,
            cost_basis: cost,
            market_value: market,
            current_market_value: market,
            unrealized_gain: newGain,
          }
        }
      })

      await queryClient.invalidateQueries({ queryKey: ['dashboard-item-details', card.id] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard-inventory'] })
      setShowMetricsEditModal(false)
    } catch (err: any) {
      setMetricsError(err.message || 'Failed to update cost basis and market value')
    } finally {
      setIsUpdatingMetrics(false)
    }
  }

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

  // Price History & Comps Trend Data (Combining Sold Comps & Active Listings for eBay and MySlabs)
  const chartData = useMemo(() => {
    const rawPoints: Array<{
      dateObj: Date
      ebaySold?: number
      myslabsSold?: number
      ebayActive?: number
      myslabsActive?: number
    }> = []

    filteredEbaySold.forEach((c: any) => {
      const d = c.sold_at || c.soldAt || c.endDate || c.created_at
      const p = Number(c.sold_price || c.soldPrice?.value || c.price || 0)
      if (p > 0) rawPoints.push({ dateObj: d ? new Date(d) : new Date(), ebaySold: p })
    })

    filteredMyslabsSold.forEach((c: any) => {
      const d = c.sold_at || c.soldAt || c.endDate || c.created_at
      const p = Number(c.sold_price || c.soldPrice?.value || c.price || 0)
      if (p > 0) rawPoints.push({ dateObj: d ? new Date(d) : new Date(), myslabsSold: p })
    })

    filteredEbayActive.forEach((a: any) => {
      const d = a.last_seen_at || a.created_at
      const p = Number(a.list_price || a.price?.value || a.price || 0)
      if (p > 0) rawPoints.push({ dateObj: d ? new Date(d) : new Date(), ebayActive: p })
    })

    filteredMyslabsActive.forEach((a: any) => {
      const d = a.last_seen_at || a.created_at
      const p = Number(a.list_price || a.price?.value || a.price || 0)
      if (p > 0) rawPoints.push({ dateObj: d ? new Date(d) : new Date(), myslabsActive: p })
    })

    if (rawPoints.length === 0) return []

    rawPoints.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())

    return rawPoints.map((pt, idx) => ({
      date: pt.dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      ebaySold: pt.ebaySold ?? null,
      myslabsSold: pt.myslabsSold ?? null,
      ebayActive: pt.ebayActive ?? null,
      myslabsActive: pt.myslabsActive ?? null,
    }))
  }, [filteredEbaySold, filteredMyslabsSold, filteredEbayActive, filteredMyslabsActive])

  const gradeLabel = selectedGradeKey === 'RAW' ? 'RAW' : `GRADE ${selectedGradeKey}`
  const gradeCfg = getGradeConfig(detailedCard.grade_key, detailedCard)

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
          {/* Card Image with Edit Overlay */}
          <div className="relative h-72 w-52 shrink-0 overflow-hidden rounded-2xl border border-[#252525] bg-[#141414] shadow-lg group">
            <Image
              src={detailedCard.image_url && detailedCard.image_url.trim() ? detailedCard.image_url.trim() : '/placeholder.png'}
              alt={detailedCard.player_name}
              fill
              className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
            />
            {/* Edit Image Button */}
            <button
              type="button"
              onClick={() => {
                setNewImageUrl(detailedCard.image_url || '')
                setSelectedFile(null)
                setFilePreview(null)
                setShowImageEditModal(true)
              }}
              className="absolute top-2 left-2 z-20 flex items-center gap-1 rounded-lg bg-black/80 hover:bg-black border border-white/20 px-2 py-1 text-[11px] font-bold text-white shadow-lg backdrop-blur-md transition-all hover:scale-105"
              title="Edit Card Image"
            >
              <Camera className="h-3.5 w-3.5 text-blue-400" />
              <span>Edit Image</span>
            </button>

            {detailedCard.quantity && detailedCard.quantity > 1 ? (
              <span className="absolute top-2 right-2 rounded-lg bg-black/90 border border-white/20 px-2.5 py-1 font-mono text-xs font-bold text-white shadow-lg">
                &times;{detailedCard.quantity}
              </span>
            ) : null}
          </div>

          {/* Card Meta & Badges */}
          <div className="flex-1 text-center md:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-2">
              {/* Grade Badge + Edit Icon */}
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex items-center rounded-lg border px-3 py-1 text-xs uppercase ${gradeCfg.badgeStyle}`}>
                  {gradeCfg.label}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditGradeCompany(detailedCard.grade_company || 'PSA')
                    setEditGradeValue(detailedCard.grade_value || '10')
                    setShowGradeEditModal(true)
                  }}
                  className="p-1 rounded-lg border border-[#252525] bg-[#141414] text-zinc-400 hover:text-white hover:border-[#333] transition-colors"
                  title="Edit grade company & number"
                >
                  <Pencil className="h-3.5 w-3.5 text-amber-400" />
                </button>
              </div>

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
              {/* Cost Basis Card */}
              <div className="relative group rounded-xl border border-[#252525] bg-[#141414] p-3 transition-colors hover:border-[#333]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Cost Basis</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditCostBasis(String(detailedCard.cost_basis ?? 0))
                      setEditMarketValue(String(detailedCard.market_value ?? 0))
                      setShowMetricsEditModal(true)
                    }}
                    className="p-1 rounded bg-[#0D0D0D] border border-[#252525] text-zinc-400 hover:text-white hover:border-blue-500 transition-colors"
                    title="Edit Cost Basis & Target Market"
                  >
                    <Pencil className="h-3 w-3 text-blue-400" />
                  </button>
                </div>
                <span className="font-mono text-lg font-bold text-white block mt-0.5">{formatCurrency(detailedCard.cost_basis)}</span>
              </div>

              {/* Target Market Card */}
              <div className="relative group rounded-xl border border-blue-500/40 bg-blue-500/15 p-3 transition-colors hover:border-blue-500/60">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider block">Target Market</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditCostBasis(String(detailedCard.cost_basis ?? 0))
                      setEditMarketValue(String(detailedCard.market_value ?? 0))
                      setShowMetricsEditModal(true)
                    }}
                    className="p-1 rounded bg-[#0D0D0D] border border-blue-500/40 text-blue-300 hover:text-white hover:border-blue-400 transition-colors"
                    title="Edit Cost Basis & Target Market"
                  >
                    <Pencil className="h-3 w-3 text-blue-400" />
                  </button>
                </div>
                <span className="font-mono text-lg font-bold text-white block mt-0.5">{formatCurrency(detailedCard.market_value)}</span>
              </div>

              {/* Unrealized P&L Card */}
              <div className="rounded-xl border border-[#252525] bg-[#141414] p-3">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Unrealized P&amp;L</span>
                <span className={`font-mono text-lg font-bold block mt-0.5 ${detailedCard.unrealized_gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {detailedCard.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(detailedCard.unrealized_gain)}
                </span>
              </div>

              {/* Holding Time Card */}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400">
                <LineChartIcon className="w-4 h-4" />
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

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-3 bg-[#0D0D0D] px-3.5 py-1.5 rounded-xl border border-[#252525] text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-zinc-200">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#E8001C]" /> eBay Sold
                </span>
                <span className="flex items-center gap-1.5 text-zinc-200">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6]" /> MySlabs Sold
                </span>
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" /> eBay Active
                </span>
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" /> MySlabs Active
                </span>
              </div>

              <div className="flex items-center gap-1 bg-[#0D0D0D] p-1 rounded-xl border border-[#252525]">
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
          </div>

          <div className="h-64 w-full pt-2">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
                  <XAxis dataKey="date" stroke="#71717A" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717A" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-[#333] bg-[#0D0D0D] p-3 shadow-xl text-xs space-y-1.5">
                            <p className="text-zinc-400 font-semibold border-b border-[#252525] pb-1">
                              {payload[0]?.payload?.date}
                            </p>
                            {payload.map((entry: any, i: number) => {
                              if (entry.value === null || entry.value === undefined) return null
                              return (
                                <div key={i} className="flex items-center justify-between gap-4">
                                  <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    {entry.name}:
                                  </span>
                                  <span className="font-mono font-bold text-white">${Number(entry.value).toFixed(2)}</span>
                                </div>
                              )
                            })}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line type="monotone" dataKey="ebaySold" name="eBay Sold" stroke="#E8001C" strokeWidth={2.5} dot={{ r: 4, fill: '#E8001C' }} connectNulls />
                  <Line type="monotone" dataKey="myslabsSold" name="MySlabs Sold" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4, fill: '#3B82F6' }} connectNulls />
                  <Line type="monotone" dataKey="ebayActive" name="eBay Active" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: '#F59E0B' }} connectNulls />
                  <Line type="monotone" dataKey="myslabsActive" name="MySlabs Active" stroke="#10B981" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: '#10B981' }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#2D2D2D] bg-[#0D0D0D] p-6 text-center">
                <AlertCircle className="w-9 h-9 text-amber-500/80 mb-2" />
                <h5 className="text-sm font-bold text-white">No exact sales comps or active listings for {gradeLabel}</h5>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                  We do not have any cached verified sales comps or active marketplace listings for this grade.
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
                      {listing.image_url && String(listing.image_url).trim() ? (
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
            Manage inventory status &amp; sales transactions
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-5 py-2.5 text-xs font-bold text-red-400 shadow-sm transition-all"
            >
              <Trash2 className="h-4 w-4 shrink-0 text-red-400" />
              <span>Delete Card</span>
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

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Card from Inventory"
        message={`Are you sure you want to delete "${detailedCard.player_name || 'this card'}" from your inventory? Comps and player info will remain saved.`}
        confirmText="Delete Card"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingCard}
        onConfirm={async () => {
          setIsDeletingCard(true)
          try {
            await inventoryService.deleteItem(detailedCard.id)
            queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
            setShowDeleteConfirm(false)
            onClose()
          } catch (err) {
            console.error(err)
          } finally {
            setIsDeletingCard(false)
          }
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Image Edit Modal */}
      {showImageEditModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Camera className="h-5 w-5 text-blue-400" />
                Update &amp; Replace Card Image
              </h3>
              <button
                type="button"
                onClick={() => setShowImageEditModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2 bg-[#141414] p-1 rounded-xl border border-[#252525] mb-4">
              <button
                type="button"
                onClick={() => setImageMode('upload')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  imageMode === 'upload' ? 'bg-[#252525] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Upload className="h-3.5 w-3.5 text-blue-400" />
                <span>Upload Local File</span>
              </button>
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  imageMode === 'url' ? 'bg-[#252525] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
                <span>Paste Web URL</span>
              </button>
            </div>

            <div className="space-y-4">
              {imageMode === 'upload' ? (
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1.5">Choose Image File from Computer</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#333] hover:border-blue-500 bg-[#141414] hover:bg-[#1A1A1A] rounded-xl cursor-pointer transition-colors p-4 text-center group">
                    <Upload className="h-8 w-8 text-zinc-500 group-hover:text-blue-400 transition-colors mb-2" />
                    <span className="text-xs font-semibold text-zinc-300 group-hover:text-white">
                      {selectedFile ? selectedFile.name : 'Click to select JPG / PNG image file'}
                    </span>
                    <span className="text-[10px] text-zinc-500 mt-1">Replaces existing image in card DB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1.5">Direct Image Web URL</label>
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => {
                      setNewImageUrl(e.target.value)
                      setImageError('')
                    }}
                    placeholder="https://example.com/card-image.jpg"
                    className="w-full rounded-xl border border-[#252525] bg-[#141414] px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* Preview Container */}
              {Boolean(imageMode === 'upload' ? filePreview : (newImageUrl && newImageUrl.trim())) && (
                <div className="relative h-44 w-full overflow-hidden rounded-xl border border-[#252525] bg-[#141414] p-2 flex flex-col items-center justify-center">
                  <img
                    src={(imageMode === 'upload' ? filePreview : newImageUrl.trim()) || ''}
                    alt="New Card Preview"
                    className="h-full w-full object-contain"
                    onError={() => {
                      if (imageMode === 'url') setImageError('Invalid image URL format')
                    }}
                  />
                </div>
              )}

              {imageError && (
                <p className="text-xs text-red-400 font-semibold">{imageError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImageEditModal(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveImage}
                  disabled={isUpdatingImage || (imageMode === 'upload' ? !selectedFile : !newImageUrl.trim())}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg transition-colors disabled:opacity-50"
                >
                  {isUpdatingImage ? 'Uploading & Replacing...' : 'Save & Replace Image'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grade Edit Modal */}
      {showGradeEditModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Pencil className="h-5 w-5 text-amber-400" />
                Edit Grade &amp; Company
              </h3>
              <button
                type="button"
                onClick={() => setShowGradeEditModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1.5">Grading Company</label>
                <select
                  value={editGradeCompany}
                  onChange={(e) => setEditGradeCompany(e.target.value)}
                  className="w-full rounded-xl border border-[#252525] bg-[#141414] px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                >
                  <option value="PSA">PSA (Professional Sports Authenticator)</option>
                  <option value="BGS">BGS (Beckett Grading Services)</option>
                  <option value="SGC">SGC (Sportscard Guaranty)</option>
                  <option value="CGC">CGC (Certified Guaranty Company)</option>
                  <option value="RAW">RAW / Ungraded</option>
                </select>
              </div>

              {editGradeCompany !== 'RAW' && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1.5">Grade Value / Number</label>
                  <select
                    value={editGradeValue}
                    onChange={(e) => setEditGradeValue(e.target.value)}
                    className="w-full rounded-xl border border-[#252525] bg-[#141414] px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                  >
                    <option value="10">10 (Gem Mint)</option>
                    <option value="9.5">9.5 (Mint+)</option>
                    <option value="9">9 (Mint)</option>
                    <option value="8.5">8.5 (NM-MT+)</option>
                    <option value="8">8 (NM-MT)</option>
                    <option value="7">7 (Near Mint)</option>
                    <option value="6">6 (EX-MT)</option>
                    <option value="5">5 (EX)</option>
                  </select>
                </div>
              )}

              {gradeError && (
                <p className="text-xs text-red-400 font-semibold">{gradeError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGradeEditModal(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveGrade}
                  disabled={isUpdatingGrade}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-extrabold text-black shadow-lg transition-colors disabled:opacity-50"
                >
                  {isUpdatingGrade ? 'Saving...' : 'Save Grade'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics (Cost Basis & Target Market) Edit Modal */}
      {showMetricsEditModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-400" />
                Edit Cost Basis &amp; Target Market
              </h3>
              <button
                type="button"
                onClick={() => setShowMetricsEditModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1.5">Cost Basis ($)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-zinc-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editCostBasis}
                    onChange={(e) => {
                      setEditCostBasis(e.target.value)
                      setMetricsError('')
                    }}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-[#252525] bg-[#141414] pl-8 pr-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500 font-mono font-bold"
                  />
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 block">What you paid for this card</span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-blue-400 mb-1.5">Target Market Price ($)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-blue-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editMarketValue}
                    onChange={(e) => {
                      setEditMarketValue(e.target.value)
                      setMetricsError('')
                    }}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-blue-500/40 bg-[#141414] pl-8 pr-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500 font-mono font-bold"
                  />
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 block">Your target listing or estimated valuation</span>
              </div>

              {metricsError && (
                <p className="text-xs text-red-400 font-semibold">{metricsError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMetricsEditModal(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveMetrics}
                  disabled={isUpdatingMetrics}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg transition-colors disabled:opacity-50"
                >
                  {isUpdatingMetrics ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
