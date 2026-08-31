'use client'

import { useState, useEffect } from 'react'
import SuperAdminShell from '@/components/super-admin/SuperAdminShell'
import {
  useSuperAdminCardsDashboard,
  useRefreshSuperAdminCardsDashboard,
  useSuperAdminCardsInventory,
} from '@/hooks/super-admin'
import {
  Layers,
  Sparkles,
  Award,
  Box,
  Zap,
  RefreshCw,
  Database,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Tag,
  Search,
  X,
  Loader2,
} from 'lucide-react'

export default function SuperAdminCardsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const limit = 10

  // 300ms Search Debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset to page 1 whenever search changes
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const { data: metricsData, isLoading: loadingMetrics } = useSuperAdminCardsDashboard()
  const { mutate: refreshCardsDashboard, isPending: refreshingMetrics } = useRefreshSuperAdminCardsDashboard()

  const {
    data: inventoryData,
    isLoading: loadingInventory,
    isFetching: fetchingInventory,
    error: inventoryError,
  } = useSuperAdminCardsInventory(page, limit, debouncedSearch)

  const pagination = inventoryData?.pagination
  const totalPages = pagination?.totalPages || 1
  const items = inventoryData?.data || []

  return (
    <SuperAdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              Cards Catalog & Member Inventory
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Super Admin
              </span>
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Global inventory across all member accounts with server-side debounced search and pagination.
            </p>
          </div>
          <button
            onClick={() => refreshCardsDashboard()}
            disabled={loadingMetrics || refreshingMetrics}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700/60 px-4 py-2.5 text-sm font-semibold transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-amber-400 ${refreshingMetrics ? 'animate-spin' : ''}`} />
            {refreshingMetrics ? 'Refreshing View...' : 'Refresh Cards MV'}
          </button>
        </div>

        {/* 4 Cards Dashboard Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Total Cards */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-zinc-700/90 transition">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">No of Cards</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Layers className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {loadingMetrics ? <span className="animate-pulse text-zinc-600">---</span> : metricsData?.metrics.totalCards.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-400 mt-3 pt-3 border-t border-zinc-800/60">
              Total items across all member inventories
            </p>
          </div>

          {/* Metric 2: Unique Cards */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-zinc-700/90 transition">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Unique Cards</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {loadingMetrics ? <span className="animate-pulse text-zinc-600">---</span> : metricsData?.metrics.uniqueCards.toLocaleString()}
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
              <span>Variants Count:</span>
              <strong className="text-amber-400 font-semibold">{metricsData?.metrics.totalVariants.toLocaleString() ?? 0}</strong>
            </div>
          </div>

          {/* Metric 3: Graded Cards */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-zinc-700/90 transition">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Graded Cards</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Award className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
              {loadingMetrics ? <span className="animate-pulse text-zinc-600">---</span> : metricsData?.metrics.gradedCards.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-400/90 mt-3 pt-3 border-t border-zinc-800/60">
              PSA, BGS, SGC, CSG slabs
            </p>
          </div>

          {/* Metric 4: Non-Graded / Raw Cards */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-zinc-700/90 transition">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Non-Graded Cards</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Box className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {loadingMetrics ? <span className="animate-pulse text-zinc-600">---</span> : metricsData?.metrics.nonGradedCards.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-400 mt-3 pt-3 border-t border-zinc-800/60">
              Raw condition cards
            </p>
          </div>
        </div>

        {/* Paginated Member Inventory Directory Table with Debounced Search */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                All Inventory Cards
                <span className="text-xs font-normal text-zinc-400 font-mono">
                  ({pagination?.total ?? 0} total records)
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Server-side debounced search and pagination (limit 10 per page).
              </p>
            </div>

            {/* Debounced Search Input & Query Execution Indicator */}
            <div className="flex items-center gap-3">
              {inventoryData?.performance && (
                <div className="hidden md:flex items-center gap-2 font-mono text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                  <Zap className="h-3.5 w-3.5" />
                  <span>{inventoryData.performance.queryDurationMs} ms</span>
                </div>
              )}

              <div className="relative min-w-[260px] sm:min-w-[320px]">
                <Search className="h-4 w-4 absolute left-3.5 top-3 text-zinc-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search player, set, grade, owner email..."
                  className="w-full pl-10 pr-9 py-2.5 bg-zinc-950/90 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition shadow-inner"
                />
                {fetchingInventory && (
                  <Loader2 className="h-4 w-4 absolute right-3 top-3 text-amber-400 animate-spin" />
                )}
                {!fetchingInventory && search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {inventoryError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              Failed to load cards inventory.
            </div>
          )}

          {/* Cards Directory Table */}
          <div className="overflow-x-auto rounded-xl border border-zinc-800/80">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/90 text-xs uppercase text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3.5">Card / Player</th>
                  <th className="px-4 py-3.5">Condition / Grade</th>
                  <th className="px-4 py-3.5">Variant & Set Details</th>
                  <th className="px-4 py-3.5">Member / Owner</th>
                  <th className="px-4 py-3.5">Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {loadingInventory ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-4"><div className="h-4 bg-zinc-800 rounded w-36" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-zinc-800 rounded w-20" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-zinc-800 rounded w-44" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-zinc-800 rounded w-40" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-zinc-800 rounded w-8" /></td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
                      {debouncedSearch
                        ? `No cards found matching "${debouncedSearch}".`
                        : 'No inventory cards found in database.'}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/30 transition">
                      {/* Column 1: Card / Player Name */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white text-sm">{item.cardName}</div>
                        <div className="text-zinc-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                          <Tag className="h-3 w-3 text-zinc-500" />
                          <span>{item.sport || 'Sport'}</span>
                          {item.cardNumber && <span>• #{item.cardNumber}</span>}
                        </div>
                      </td>

                      {/* Column 2: Condition / Grade (Graded vs Non-Graded) */}
                      <td className="px-4 py-3.5">
                        {item.isGraded ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold font-mono text-xs shadow-sm">
                            <Award className="h-3.5 w-3.5 text-emerald-400" />
                            <span>{item.gradeCompany} {item.gradeValue || ''}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 font-medium text-xs">
                            <Box className="h-3.5 w-3.5 text-purple-400" />
                            <span>RAW (Non-Graded)</span>
                          </div>
                        )}
                      </td>

                      {/* Column 3: Variant & Set Details */}
                      <td className="px-4 py-3.5">
                        {item.isGraded ? (
                          <div className="space-y-0.5">
                            <div className="text-amber-400 font-medium flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              <span>{item.variantName || 'Base Parallel'}</span>
                              {item.printRun && <span className="text-zinc-500 text-[11px]">(/{item.printRun})</span>}
                            </div>
                            <div className="text-zinc-400 text-[11px]">
                              {item.setName || 'Set'} {item.year ? `(${item.year})` : ''} {item.variation ? `• ${item.variation}` : ''}
                            </div>
                          </div>
                        ) : (
                          <div className="text-zinc-400 text-xs">
                            {item.setName || 'Base Set'} {item.year ? `(${item.year})` : ''}
                          </div>
                        )}
                      </td>

                      {/* Column 4: Member / Owner Details */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-zinc-200 flex items-center gap-1.5">
                            <UserCheck className="h-3.5 w-3.5 text-blue-400" />
                            {item.member.email}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 truncate max-w-[180px]">
                            ID: {item.member.userId}
                          </span>
                        </div>
                      </td>

                      {/* Column 5: Quantity */}
                      <td className="px-4 py-3.5 font-mono text-zinc-200 font-semibold">
                        {item.quantity}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Server-Side Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 text-xs text-zinc-400">
              <div>
                Showing page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({pagination?.total} cards{debouncedSearch ? ` matching "${debouncedSearch}"` : ''})
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loadingInventory}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`h-8 w-8 rounded-lg font-medium transition ${
                          page === pageNum
                            ? 'bg-amber-500 text-zinc-950 font-bold'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loadingInventory}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SuperAdminShell>
  )
}
