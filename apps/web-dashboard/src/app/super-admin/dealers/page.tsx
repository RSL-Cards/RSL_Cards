'use client'

import { useState, useEffect } from 'react'
import SuperAdminShell from '@/components/super-admin/SuperAdminShell'
import {
  Store,
  CheckCircle,
  Search,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Package,
  DollarSign,
  TrendingUp,
  Award,
  Layers,
  Calendar,
  Zap,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import {
  useSuperAdminDealersMetrics,
  useSuperAdminDealersList,
  useSuperAdminDealerDetail,
  useSuperAdminDealerInventory,
  useSuperAdminDealerSoldCards,
  useRefreshSuperAdminDealersMetrics,
} from '@/hooks/super-admin/useSuperAdmin'

const formatCurrency = (val: number | string | null | undefined) => {
  const num = typeof val === 'number' ? val : parseFloat(String(val || '0'))
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(isNaN(num) ? 0 : num)
}

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return 'N/A'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default function SuperAdminDealersPage() {
  // Dealers List State
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Selected Dealer Detail Modal State
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'inventory' | 'sold'>('inventory')

  // Dealer Inventory Tab State
  const [invPage, setInvPage] = useState(1)
  const [invSearchInput, setInvSearchInput] = useState('')
  const [invDebouncedSearch, setInvDebouncedSearch] = useState('')

  // Dealer Sold Cards Tab State
  const [soldPage, setSoldPage] = useState(1)
  const [soldSearchInput, setSoldSearchInput] = useState('')
  const [soldDebouncedSearch, setSoldDebouncedSearch] = useState('')

  // Image Lightbox State
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null)

  // 300ms Search Debounce Effects
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    const timer = setTimeout(() => {
      setInvDebouncedSearch(invSearchInput)
      setInvPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [invSearchInput])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSoldDebouncedSearch(soldSearchInput)
      setSoldPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [soldSearchInput])

  // Queries
  const { data: metricsData, isLoading: isMetricsLoading } = useSuperAdminDealersMetrics()
  const { data: dealersData, isLoading: isDealersLoading } = useSuperAdminDealersList(
    page,
    limit,
    debouncedSearch
  )

  const { data: dealerDetailData, isLoading: isDealerDetailLoading } = useSuperAdminDealerDetail(selectedDealerId)
  const { data: dealerInvData, isLoading: isDealerInvLoading } = useSuperAdminDealerInventory(
    selectedDealerId,
    invPage,
    10,
    invDebouncedSearch
  )
  const { data: dealerSoldData, isLoading: isDealerSoldLoading } = useSuperAdminDealerSoldCards(
    selectedDealerId,
    soldPage,
    10,
    soldDebouncedSearch
  )

  const refreshMetrics = useRefreshSuperAdminDealersMetrics()

  const metrics = metricsData?.metrics || {
    totalDealers: 0,
    activeDealers: 0,
    totalInventoryCards: 0,
    totalInventoryValue: 0,
    totalSalesVolume: 0,
  }

  const dealersList = dealersData?.data || []
  const pagination = dealersData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 }

  const handleOpenDealer = (dealerId: string) => {
    setSelectedDealerId(dealerId)
    setActiveTab('inventory')
    setInvPage(1)
    setSoldPage(1)
    setInvSearchInput('')
    setSoldSearchInput('')
  }

  return (
    <SuperAdminShell>
      <div className="space-y-6">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              Dealers Management
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Super Admin
              </span>
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Real-time dealer directory, inventory cards, sales tracking, and card image preview.
            </p>
          </div>

          <button
            onClick={() => refreshMetrics.mutate()}
            disabled={refreshMetrics.isPending}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshMetrics.isPending ? 'animate-spin' : ''}`} />
            Refresh Metrics
          </button>
        </div>

        {/* 4 Summary Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Dealers</span>
              <Store className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">
              {isMetricsLoading ? '...' : metrics.totalDealers}
            </div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle className="h-3 w-3" /> {metrics.activeDealers} active inventory holders
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Cards</span>
              <Package className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">
              {isMetricsLoading ? '...' : (metrics.totalCards ?? (metrics.totalInventoryCards + (metrics.totalSoldCards ?? 0))).toLocaleString()}
            </div>
            <p className="text-xs text-purple-400 mt-1 font-medium">
              {metrics.totalInventoryCards} active • {metrics.totalSoldCards ?? 0} sold cards
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Inventory Value</span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">
              {isMetricsLoading ? '...' : formatCurrency(metrics.totalInventoryValue)}
            </div>
            <p className="text-xs text-emerald-400 mt-1 font-medium">Combined market portfolio value</p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Sales Volume</span>
              <TrendingUp className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">
              {isMetricsLoading ? '...' : formatCurrency(metrics.totalSalesVolume)}
            </div>
            <p className="text-xs text-amber-400 mt-1 font-medium">Cumulative sold transactions</p>
          </div>
        </div>

        {/* Dealers Table Card */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Dealer Directory</h2>
              <p className="text-xs text-zinc-400">
                Displaying server-side paginated list of dealer accounts and performance metrics.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by store, email, ID..."
                  className="pl-9 pr-4 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50 w-64"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput('')}
                    className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value))
                  setPage(1)
                }}
                className="bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-zinc-300 px-3 py-2 focus:outline-none"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-zinc-800/60">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/80 text-xs uppercase text-zinc-400 border-b border-zinc-800 font-semibold tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Dealer Store</th>
                  <th className="px-4 py-3.5">Joined Date</th>
                  <th className="px-4 py-3.5">Active Inventory</th>
                  <th className="px-4 py-3.5">Sales Performance</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs font-normal">
                {isDealersLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-400" />
                      Loading dealer records...
                    </td>
                  </tr>
                ) : dealersList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                      No dealers found matching &quot;{debouncedSearch}&quot;.
                    </td>
                  </tr>
                ) : (
                  dealersList.map((dealer) => (
                    <tr key={dealer.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-semibold text-sm">
                            {dealer.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={dealer.photoUrl}
                                alt={dealer.displayName}
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              dealer.displayName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              {dealer.displayName}
                              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                            </div>
                            <div className="text-zinc-400 font-mono text-[11px]">{dealer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-400">{formatDate(dealer.createdAt)}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white font-mono">
                          {dealer.metrics.inventoryCount} cards
                        </div>
                        <div className="text-emerald-400 font-mono text-[11px]">
                          {formatCurrency(dealer.metrics.inventoryValue)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white font-mono">
                          {dealer.metrics.soldCount} sold
                        </div>
                        <div className="text-amber-400 font-mono text-[11px]">
                          {formatCurrency(dealer.metrics.totalSalesVolume)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="h-3 w-3" /> Active Dealer
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenDealer(dealer.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-semibold transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 pt-2">
            <div>
              Showing Page <span className="font-semibold text-white">{pagination.page}</span> of{' '}
              <span className="font-semibold text-white">{pagination.totalPages}</span> ({pagination.total} total dealers)
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dealer Detail Drawer / Modal */}
      {selectedDealerId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-800/80 bg-zinc-950/80 flex items-start justify-between gap-4">
              {isDealerDetailLoading ? (
                <div className="flex items-center gap-3 text-zinc-400">
                  <RefreshCw className="h-5 w-5 animate-spin text-blue-400" />
                  Loading dealer profile...
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-extrabold text-lg shadow-inner">
                    {dealerDetailData?.dealer.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={dealerDetailData.dealer.photoUrl}
                        alt={dealerDetailData.dealer.displayName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      dealerDetailData?.dealer.displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      {dealerDetailData?.dealer.displayName}
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Dealer Account
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5 flex items-center gap-3">
                      <span>{dealerDetailData?.dealer.email}</span>
                      <span>•</span>
                      <span>Joined {formatDate(dealerDetailData?.dealer.createdAt)}</span>
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedDealerId(null)}
                className="p-2 rounded-xl bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Metrics Banner */}
            {dealerDetailData && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-zinc-950/40 border-b border-zinc-800/60 text-xs">
                <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-3">
                  <div className="text-zinc-400 font-medium">Total Cards</div>
                  <div className="text-lg font-extrabold text-purple-400 mt-0.5 font-mono">
                    {dealerDetailData.dealer.metrics.totalCards ?? (dealerDetailData.dealer.metrics.inventoryCount + dealerDetailData.dealer.metrics.soldCount)}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Active + Sold</div>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-3">
                  <div className="text-zinc-400 font-medium">Active Inventory</div>
                  <div className="text-lg font-extrabold text-white mt-0.5 font-mono">
                    {dealerDetailData.dealer.metrics.inventoryCount}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Unlisted & Listed</div>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-3">
                  <div className="text-zinc-400 font-medium">Portfolio Value</div>
                  <div className="text-lg font-extrabold text-emerald-400 mt-0.5 font-mono">
                    {formatCurrency(dealerDetailData.dealer.metrics.inventoryValue)}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Market Value</div>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-3">
                  <div className="text-zinc-400 font-medium">Sold Cards</div>
                  <div className="text-lg font-extrabold text-white mt-0.5 font-mono">
                    {dealerDetailData.dealer.metrics.soldCount}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Completed Sales</div>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-3">
                  <div className="text-zinc-400 font-medium">Total Revenue</div>
                  <div className="text-lg font-extrabold text-amber-400 mt-0.5 font-mono">
                    {formatCurrency(dealerDetailData.dealer.metrics.totalSalesVolume)}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Sales Revenue</div>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="flex border-b border-zinc-800/80 bg-zinc-950/60 px-6 gap-6 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('inventory')}
                className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === 'inventory'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Package className="h-4 w-4" />
                Active Inventory Cards ({dealerDetailData?.dealer.metrics.inventoryCount ?? 0})
              </button>
              <button
                onClick={() => setActiveTab('sold')}
                className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === 'sold'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Sold Cards ({dealerDetailData?.dealer.metrics.soldCount ?? 0})
              </button>
            </div>

            {/* Modal Body / Tab Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {activeTab === 'inventory' ? (
                <div className="space-y-4">
                  {/* Search Bar for Inventory */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-zinc-500" />
                      <input
                        type="text"
                        value={invSearchInput}
                        onChange={(e) => setInvSearchInput(e.target.value)}
                        placeholder="Search dealer inventory by player, set, grade..."
                        className="pl-9 pr-4 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50 w-full"
                      />
                    </div>
                    <div className="text-xs text-zinc-400 font-mono">
                      Showing Page {dealerInvData?.pagination.page || 1} of{' '}
                      {dealerInvData?.pagination.totalPages || 1}
                    </div>
                  </div>

                  {/* Inventory Grid / Table */}
                  <div className="overflow-x-auto rounded-xl border border-zinc-800/60">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-zinc-950/80 text-[11px] uppercase text-zinc-400 border-b border-zinc-800 font-semibold tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Card Image</th>
                          <th className="px-4 py-3">Card Details</th>
                          <th className="px-4 py-3">Grade</th>
                          <th className="px-4 py-3">Cost Basis</th>
                          <th className="px-4 py-3">Market Value</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 font-normal">
                        {isDealerInvLoading ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                              <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-400" />
                              Loading dealer inventory cards...
                            </td>
                          </tr>
                        ) : dealerInvData?.data.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                              No inventory cards found for this dealer.
                            </td>
                          </tr>
                        ) : (
                          dealerInvData?.data.map((item) => (
                            <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                              <td className="px-4 py-3">
                                <div
                                  onClick={() =>
                                    item.imageUrl && setLightboxImage({ url: item.imageUrl, title: item.cardName })
                                  }
                                  className={`h-12 w-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden relative group ${
                                    item.imageUrl ? 'cursor-pointer' : ''
                                  }`}
                                >
                                  {item.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={item.imageUrl}
                                      alt={item.cardName}
                                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-200"
                                    />
                                  ) : (
                                    <Package className="h-4 w-4 text-zinc-600" />
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-semibold text-white">{item.cardName}</div>
                                <div className="text-zinc-400 text-[11px]">
                                  {item.setName} {item.variation ? `• ${item.variation}` : ''}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-zinc-800 text-amber-400 border border-amber-500/20">
                                  {item.gradeKey}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono text-zinc-300">
                                {formatCurrency(item.costBasis)}
                              </td>
                              <td className="px-4 py-3 font-mono font-semibold text-emerald-400">
                                {formatCurrency(item.currentMarketValue)}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                    item.listingStatus === 'listed'
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-zinc-800 text-zinc-400'
                                  }`}
                                >
                                  {item.listingStatus}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Inventory Pagination */}
                  {dealerInvData && dealerInvData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
                      <div>
                        Page {dealerInvData.pagination.page} of {dealerInvData.pagination.totalPages}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setInvPage((p) => Math.max(1, p - 1))}
                          disabled={invPage <= 1}
                          className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 disabled:opacity-40"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setInvPage((p) => Math.min(dealerInvData.pagination.totalPages, p + 1))}
                          disabled={invPage >= dealerInvData.pagination.totalPages}
                          className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 disabled:opacity-40"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Sold Cards Tab */
                <div className="space-y-4">
                  {/* Search Bar for Sold */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-zinc-500" />
                      <input
                        type="text"
                        value={soldSearchInput}
                        onChange={(e) => setSoldSearchInput(e.target.value)}
                        placeholder="Search sold cards by title, player, platform..."
                        className="pl-9 pr-4 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50 w-full"
                      />
                    </div>
                    <div className="text-xs text-zinc-400 font-mono">
                      Showing Page {dealerSoldData?.pagination.page || 1} of{' '}
                      {dealerSoldData?.pagination.totalPages || 1}
                    </div>
                  </div>

                  {/* Sold Cards Table */}
                  <div className="overflow-x-auto rounded-xl border border-zinc-800/60">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-zinc-950/80 text-[11px] uppercase text-zinc-400 border-b border-zinc-800 font-semibold tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Card Image</th>
                          <th className="px-4 py-3">Sold Card</th>
                          <th className="px-4 py-3">Grade</th>
                          <th className="px-4 py-3">Sold Price</th>
                          <th className="px-4 py-3">Net Profit</th>
                          <th className="px-4 py-3">Platform</th>
                          <th className="px-4 py-3">Sold Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 font-normal">
                        {isDealerSoldLoading ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                              <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-400" />
                              Loading dealer sold transaction history...
                            </td>
                          </tr>
                        ) : dealerSoldData?.data.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                              No sold transactions found for this dealer.
                            </td>
                          </tr>
                        ) : (
                          dealerSoldData?.data.map((item) => {
                            const profitNum = parseFloat(item.profit || '0')
                            return (
                              <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                                <td className="px-4 py-3">
                                  <div
                                    onClick={() =>
                                      item.imageUrl && setLightboxImage({ url: item.imageUrl, title: item.title })
                                    }
                                    className={`h-12 w-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden relative group ${
                                      item.imageUrl ? 'cursor-pointer' : ''
                                    }`}
                                  >
                                    {item.imageUrl ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-200"
                                      />
                                    ) : (
                                      <Package className="h-4 w-4 text-zinc-600" />
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="font-semibold text-white">{item.title}</div>
                                  <div className="text-zinc-400 text-[11px]">{item.setName}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-zinc-800 text-amber-400 border border-amber-500/20">
                                    {item.gradeKey}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-mono font-semibold text-amber-400">
                                  {formatCurrency(item.soldPrice)}
                                </td>
                                <td className="px-4 py-3 font-mono font-semibold">
                                  <span
                                    className={profitNum >= 0 ? 'text-emerald-400' : 'text-red-400'}
                                  >
                                    {profitNum >= 0 ? '+' : ''}
                                    {formatCurrency(profitNum)}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                                    {item.platform}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-zinc-400">{formatDate(item.soldAt)}</td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Sold Pagination */}
                  {dealerSoldData && dealerSoldData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
                      <div>
                        Page {dealerSoldData.pagination.page} of {dealerSoldData.pagination.totalPages}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSoldPage((p) => Math.max(1, p - 1))}
                          disabled={soldPage <= 1}
                          className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 disabled:opacity-40"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setSoldPage((p) => Math.min(dealerSoldData.pagination.totalPages, p + 1))}
                          disabled={soldPage >= dealerSoldData.pagination.totalPages}
                          className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 disabled:opacity-40"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Card Image Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-xl max-h-[85vh] p-2 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="max-h-[75vh] w-auto object-contain rounded-xl"
            />
            <p className="text-xs font-semibold text-white mt-3 text-center px-4">
              {lightboxImage.title}
            </p>
          </div>
        </div>
      )}
    </SuperAdminShell>
  )
}
