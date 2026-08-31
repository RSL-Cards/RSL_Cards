'use client'

import { useState, useEffect } from 'react'
import SuperAdminShell from '@/components/super-admin/SuperAdminShell'
import {
  useSuperAdminUsersMetrics,
  useRefreshSuperAdminUsersMetrics,
  useSuperAdminUsersList,
} from '@/hooks/super-admin'
import {
  Users,
  Store,
  UserCheck,
  ShieldCheck,
  Crown,
  Search,
  X,
  Loader2,
  RefreshCw,
  Zap,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
} from 'lucide-react'

export default function SuperAdminUsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const limit = 10

  // 300ms Search Debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset to page 1 on search change
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const { data: metricsData, isLoading: loadingMetrics } = useSuperAdminUsersMetrics()
  const { mutate: refreshUsersMetrics, isPending: refreshingMetrics } = useRefreshSuperAdminUsersMetrics()

  const {
    data: usersData,
    isLoading: loadingUsers,
    isFetching: fetchingUsers,
    error: usersError,
  } = useSuperAdminUsersList(page, limit, debouncedSearch)

  const pagination = usersData?.pagination
  const totalPages = pagination?.totalPages || 1
  const users = usersData?.data || []

  // Role Badge Helper
  const renderRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super-admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 font-semibold text-xs shadow-sm">
            <Crown className="h-3.5 w-3.5" /> Super Admin
          </span>
        )
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold text-xs shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" /> Admin
          </span>
        )
      case 'dealer':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 font-semibold text-xs shadow-sm">
            <Store className="h-3.5 w-3.5" /> Dealer
          </span>
        )
      case 'consumer':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 font-medium text-xs shadow-sm">
            <UserCheck className="h-3.5 w-3.5" /> Consumer
          </span>
        )
    }
  }

  return (
    <SuperAdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              User Management Directory
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Super Admin
              </span>
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Global system accounts overview with role analytics and server-side debounced search.
            </p>
          </div>
          <button
            onClick={() => refreshUsersMetrics()}
            disabled={loadingMetrics || refreshingMetrics}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700/60 px-4 py-2.5 text-sm font-semibold transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-blue-400 ${refreshingMetrics ? 'animate-spin' : ''}`} />
            {refreshingMetrics ? 'Refreshing View...' : 'Refresh Users MV'}
          </button>
        </div>

        {/* 5 Metrics Header Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Total Users */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-zinc-700/90 transition">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Users</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {loadingMetrics ? <span className="animate-pulse text-zinc-600">---</span> : metricsData?.metrics.totalUsers.toLocaleString()}
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 pt-2 border-t border-zinc-800/60">
              Registered platform accounts
            </p>
          </div>

          {/* Card 2: Dealers */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-zinc-700/90 transition">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Dealers</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Store className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-blue-400 tracking-tight">
              {loadingMetrics ? <span className="animate-pulse text-zinc-600">---</span> : metricsData?.metrics.totalDealers.toLocaleString()}
            </div>
            <p className="text-[11px] text-blue-400/90 mt-2 pt-2 border-t border-zinc-800/60">
              Active card dealer stores
            </p>
          </div>

          {/* Card 3: Consumers */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-zinc-700/90 transition">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Consumers</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <UserCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-purple-400 tracking-tight">
              {loadingMetrics ? <span className="animate-pulse text-zinc-600">---</span> : metricsData?.metrics.totalConsumers.toLocaleString()}
            </div>
            <p className="text-[11px] text-purple-400/90 mt-2 pt-2 border-t border-zinc-800/60">
              Collectors & buyers
            </p>
          </div>

          {/* Card 4: Admins */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-zinc-700/90 transition">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Admins</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-amber-400 tracking-tight">
              {loadingMetrics ? <span className="animate-pulse text-zinc-600">---</span> : metricsData?.metrics.totalAdmins.toLocaleString()}
            </div>
            <p className="text-[11px] text-amber-400/90 mt-2 pt-2 border-t border-zinc-800/60">
              System moderators
            </p>
          </div>

          {/* Card 5: Super-Admins */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-zinc-700/90 transition">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Super-Admins</span>
              <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                <Crown className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-red-400 tracking-tight">
              {loadingMetrics ? <span className="animate-pulse text-zinc-600">---</span> : metricsData?.metrics.totalSuperAdmins.toLocaleString()}
            </div>
            <p className="text-[11px] text-red-400/90 mt-2 pt-2 border-t border-zinc-800/60">
              Root administrators
            </p>
          </div>
        </div>

        {/* Paginated Users Directory Table with Debounced Search */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                All System Users
                <span className="text-xs font-normal text-zinc-400 font-mono">
                  ({pagination?.total ?? 0} total records)
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Server-side debounced search and pagination (limit 10 per page).
              </p>
            </div>

            {/* Debounced Search Input */}
            <div className="flex items-center gap-3">
              {usersData?.performance && (
                <div className="hidden md:flex items-center gap-2 font-mono text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                  <Zap className="h-3.5 w-3.5" />
                  <span>{usersData.performance.queryDurationMs} ms</span>
                </div>
              )}

              <div className="relative min-w-[260px] sm:min-w-[320px]">
                <Search className="h-4 w-4 absolute left-3.5 top-3 text-zinc-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search user email, role, or user ID..."
                  className="w-full pl-10 pr-9 py-2.5 bg-zinc-950/90 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition shadow-inner"
                />
                {fetchingUsers && (
                  <Loader2 className="h-4 w-4 absolute right-3 top-3 text-blue-400 animate-spin" />
                )}
                {!fetchingUsers && search && (
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

          {usersError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              Failed to load users list.
            </div>
          )}

          {/* Users Directory Table */}
          <div className="overflow-x-auto rounded-xl border border-zinc-800/80">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/90 text-xs uppercase text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3.5">User Details</th>
                  <th className="px-4 py-3.5">Assigned Role</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {loadingUsers ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-4"><div className="h-4 bg-zinc-800 rounded w-48" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-zinc-800 rounded w-24" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-zinc-800 rounded w-20" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-zinc-800 rounded w-32" /></td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-zinc-500">
                      {debouncedSearch
                        ? `No users found matching "${debouncedSearch}".`
                        : 'No user accounts found in database.'}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-800/30 transition">
                      {/* Column 1: User Details (Email & ID) */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white text-sm">{user.email}</div>
                        <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                          ID: {user.id}
                        </div>
                      </td>

                      {/* Column 2: Assigned Role Badge */}
                      <td className="px-4 py-3.5">
                        {renderRoleBadge(user.role)}
                      </td>

                      {/* Column 3: Status */}
                      <td className="px-4 py-3.5">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle className="h-3.5 w-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-zinc-500 font-medium">
                            <Clock className="h-3.5 w-3.5" /> Inactive
                          </span>
                        )}
                      </td>

                      {/* Column 4: Created Date */}
                      <td className="px-4 py-3.5 text-zinc-400 font-mono text-xs">
                        {new Date(user.createdAt).toLocaleDateString()} {new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                Showing page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({pagination?.total} users{debouncedSearch ? ` matching "${debouncedSearch}"` : ''})
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loadingUsers}
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
                            ? 'bg-blue-500 text-white font-bold'
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
                  disabled={page === totalPages || loadingUsers}
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
