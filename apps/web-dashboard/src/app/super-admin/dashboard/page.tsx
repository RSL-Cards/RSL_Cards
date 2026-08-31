'use client'

import SuperAdminShell from '@/components/super-admin/SuperAdminShell'
import { useSuperAdminDashboard, useRefreshSuperAdminDashboard } from '@/hooks/super-admin'
import { Users, Layers, Sparkles, Zap, RefreshCw, Database, CheckCircle } from 'lucide-react'

export default function SuperAdminDashboardPage() {
  const { data, isLoading: loading, error: queryError } = useSuperAdminDashboard()
  const { mutate: refreshDashboard, isPending: refreshing } = useRefreshSuperAdminDashboard()

  const errorMessage = queryError ? (queryError as any)?.message || 'Failed to load metrics' : null

  return (
    <SuperAdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              Super Admin Dashboard
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                TanStack Query
              </span>
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              High-performance analytics powered by Materialized Views and Composite Indexes.
            </p>
          </div>
          <button
            onClick={() => refreshDashboard()}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700/60 px-4 py-2.5 text-sm font-semibold transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-red-400 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing View...' : 'Refresh Metrics MV'}
          </button>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Users */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-zinc-700/90 transition">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Users</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {loading ? <span className="animate-pulse text-zinc-600">---</span> : data?.metrics.totalUsers.toLocaleString()}
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Dealers: <strong className="text-zinc-200 font-semibold">{data?.metrics.totalDealers ?? 0}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                Consumers: <strong className="text-zinc-200 font-semibold">{data?.metrics.totalConsumers ?? 0}</strong>
              </span>
            </div>
          </div>

          {/* Card 2: Total Cards in Database */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-zinc-700/90 transition">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Cards in Inventory</span>
              <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                <Layers className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {loading ? <span className="animate-pulse text-zinc-600">---</span> : data?.metrics.totalInventoryCards.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-400 mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
              <span>Total Inventory Items:</span>
              <strong className="text-white font-medium">{data?.metrics.totalInventoryCards.toLocaleString()}</strong>
            </p>
          </div>

          {/* Card 3: Total Unique Cards */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-zinc-700/90 transition">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Unique Catalog Cards</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {loading ? <span className="animate-pulse text-zinc-600">---</span> : data?.metrics.totalUniqueCards.toLocaleString()}
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
              <span>Card Variants:</span>
              <strong className="text-amber-400 font-semibold">{data?.metrics.totalCardVariants.toLocaleString() ?? 0}</strong>
            </div>
          </div>

          {/* Card 4: Database Optimization & Latency */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-zinc-700/90 transition">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Query Performance</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Zap className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">
              {loading ? <span className="animate-pulse text-zinc-600">---</span> : `${data?.performance.queryDurationMs ?? 0} ms`}
            </div>
            <p className="text-xs text-emerald-400/90 mt-3 pt-3 border-t border-zinc-800/60 font-mono flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5" />
              Materialized View O(1)
            </p>
          </div>
        </div>

        {/* Database Optimization Details Card */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Database Optimization Architecture</h2>
              <p className="text-xs text-zinc-400">PostgreSQL Materialized View and Composite Index Status</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/60 font-mono text-xs">
              <div className="text-zinc-500 mb-1">Materialized View</div>
              <div className="text-zinc-200 font-bold truncate">super_admin_dashboard_metrics_mv</div>
              <div className="text-emerald-400 text-[11px] mt-2">✓ Precomputed aggregations</div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/60 font-mono text-xs">
              <div className="text-zinc-500 mb-1">Composite Indexes</div>
              <div className="text-zinc-200 font-bold">idx_users_role_created</div>
              <div className="text-zinc-200 font-bold">idx_inventory_quantity_status</div>
              <div className="text-emerald-400 text-[11px] mt-1">✓ Index scans enabled</div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/60 font-mono text-xs">
              <div className="text-zinc-500 mb-1">Last View Refresh</div>
              <div className="text-zinc-200 font-bold">
                {data?.performance.lastRefreshedAt ? new Date(data.performance.lastRefreshedAt).toLocaleTimeString() : 'N/A'}
              </div>
              <div className="text-zinc-400 text-[11px] mt-2">
                {data?.performance.lastRefreshedAt ? new Date(data.performance.lastRefreshedAt).toLocaleDateString() : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminShell>
  )
}
