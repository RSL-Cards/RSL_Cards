'use client'

import { useEffect, useState, useMemo } from 'react'
import { Calendar, Filter, X, ArrowRight } from 'lucide-react'
import Shell from '@/components/layout/Shell'
import MetricCard from '@/components/dashboard/MetricCard'
import RevenueChart from '@/components/dashboard/RevenueChart'
import ProfitByChannelChart from '@/components/dashboard/ProfitByChannelChart'
import PortfolioHealth from '@/components/dashboard/PortfolioHealth'
import MarketMovers from '@/components/dashboard/MarketMovers'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import AIInsightsPreview from '@/components/dashboard/AIInsightsPreview'
import { useAuthStore } from '@/stores/authStore'
import {
  useDashboardMetrics,
  useRevenueChart,
  useChannelData,
  useDashboardInventory,
  useTopMovers,
  useRecentTransactions,
  useAiInsights,
  usePortfolioSnapshot,
} from '@/hooks/dashboard/useDashboard'
import DailyLogPanel from '@/components/dashboard/DailyLogPanel'

export default function DashboardPage() {
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const [dateFrom, setDateFrom] = useState(() => new Date().toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0])
  const [activePreset, setActivePreset] = useState<'today' | '7d' | '30d' | 'month' | 'custom'>('today')
  const [isFilterActive, setIsFilterActive] = useState(true)

  // Pass active date filters directly to backend query hooks so all dashboard data comes from backend API
  const { data: metrics, isLoading: isMetricsLoading, error: metricsError } = useDashboardMetrics(isFilterActive ? dateFrom : undefined, isFilterActive ? dateTo : undefined)
  const { data: revenueChart, isLoading: isRevLoading } = useRevenueChart(isFilterActive ? dateFrom : undefined, isFilterActive ? dateTo : undefined)
  const { data: channelData, isLoading: isChannelLoading } = useChannelData(isFilterActive ? dateFrom : undefined, isFilterActive ? dateTo : undefined)
  const { data: inventory, isLoading: isInvLoading } = useDashboardInventory()
  const { data: topMovers, isLoading: isMoversLoading } = useTopMovers()
  const { data: recentTransactions, isLoading: isTxLoading } = useRecentTransactions(isFilterActive ? dateFrom : undefined, isFilterActive ? dateTo : undefined)
  const { data: aiInsights, isLoading: isAiLoading } = useAiInsights()
  const { data: portfolioSnapshot, isLoading: isPortfolioLoading } = usePortfolioSnapshot()

  // Transactions are pre-filtered directly by backend API
  const filteredTransactions = useMemo(() => {
    return recentTransactions || []
  }, [recentTransactions])

  const displayMetrics = useMemo(() => {
    const isToday = activePreset === 'today'
    return {
      revenueTitle: isToday ? "Today's Revenue" : "Period Revenue",
      revenue: metrics?.today?.revenue || 0,
      revenueTrend: isToday ? { value: metrics?.today?.revenue_change || 0, label: 'vs yesterday' } : undefined,
      profitTitle: isToday ? "Today's Profit" : "Period Profit",
      profit: metrics?.today?.profit || 0,
      profitTrend: isToday ? { value: metrics?.today?.profit_change || 0, label: 'vs yesterday' } : undefined,
      profitSubtitle: `${(metrics?.today?.margin || 0).toFixed(1)}% margin`,
      boughtTitle: isToday ? "Cards Bought Today" : "Period Cards Bought",
      bought: metrics?.today?.cards_bought || 0,
      boughtSubtitle: `${metrics?.today?.cards_sold || 0} sold, net ${(metrics?.today?.cards_bought || 0) - (metrics?.today?.cards_sold || 0)} cards`,
      soldTitle: isToday ? "Cards Sold Today" : "Period Cards Sold",
      sold: metrics?.today?.cards_sold || 0,
      soldSubtitle: `${metrics?.today?.cards_bought || 0} bought, net ${(metrics?.today?.cards_sold || 0) - (metrics?.today?.cards_bought || 0)} card`,
    }
  }, [metrics, activePreset])

  const isLoading =
    !isHydrated ||
    isMetricsLoading ||
    isRevLoading ||
    isChannelLoading ||
    isInvLoading ||
    isMoversLoading ||
    isTxLoading ||
    isAiLoading ||
    isPortfolioLoading

  const error = metricsError ? (metricsError as Error).message : null

  if (!isHydrated || (isLoading && isAuthenticated)) {
    return (
      <Shell>
        <div className="flex h-64 items-center justify-center">
          <div className="text-sm text-gray-500">Loading dashboard...</div>
        </div>
      </Shell>
    )
  }

  if (error) {
    return (
      <Shell>
        <div className="flex h-64 items-center justify-center">
          <div className="text-sm text-red-500">{error}</div>
        </div>
      </Shell>
    )
  }

  if (!isAuthenticated || !metrics || !revenueChart || !channelData || !inventory || !topMovers || !recentTransactions || !aiInsights || !portfolioSnapshot) return null

  // Generate sparkline data for metric cards (mock function for visual effect)
  const generateSparklineData = (baseValue: number, variance: number) => {
    return Array.from({ length: 7 }, () =>
      baseValue + (Math.random() - 0.5) * variance
    )
  }

  const handleApplyPreset = (preset: 'today' | '7d' | '30d' | 'month') => {
    setActivePreset(preset)
    const end = new Date()
    const start = new Date()
    if (preset === 'today') {
      // today only
    } else if (preset === '7d') {
      start.setDate(start.getDate() - 7)
    } else if (preset === '30d') {
      start.setDate(start.getDate() - 30)
    } else if (preset === 'month') {
      start.setDate(1)
    }
    setDateFrom(start.toISOString().split('T')[0])
    setDateTo(end.toISOString().split('T')[0])
    setIsFilterActive(true)
  }

  const handleApplyCustomFilter = () => {
    setActivePreset('custom')
    setIsFilterActive(true)
  }

  const handleResetFilter = () => {
    const todayStr = new Date().toISOString().split('T')[0]
    setDateFrom(todayStr)
    setDateTo(todayStr)
    setActivePreset('today')
    setIsFilterActive(true)
  }

  return (
    <Shell>
      <div className="space-y-6">
        {/* Date Range Filter Bar */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span>Date Range Analytics</span>
                  {isFilterActive && (
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      ACTIVE FILTER
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {isFilterActive
                    ? `Showing data between ${dateFrom} and ${dateTo}`
                    : 'Filter dashboard revenue, sales, and analytics by custom date range'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Preset Buttons */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/80 p-1 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
                {(['today', '7d', '30d', 'month'] as const).map((preset) => {
                  const labels: Record<string, string> = { today: 'Today', '7d': '7 Days', '30d': '30 Days', month: 'This Month' }
                  return (
                    <button
                      key={preset}
                      onClick={() => handleApplyPreset(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activePreset === preset && isFilterActive
                        ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold ring-1 ring-black/5 dark:ring-white/10'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                      {labels[preset]}
                    </button>
                  )
                })}
              </div>

              {/* From / To Inputs */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">From</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value)
                      setActivePreset('custom')
                    }}
                    className="bg-transparent text-xs font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-pointer"
                  />
                </div>

                <ArrowRight className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />

                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">To</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value)
                      setActivePreset('custom')
                    }}
                    className="bg-transparent text-xs font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Filter Apply / Clear */}
              <button
                onClick={handleApplyCustomFilter}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Filter className="h-3.5 w-3.5" />
                <span>Apply</span>
              </button>

              {isFilterActive && (
                <button
                  onClick={handleResetFilter}
                  title="Clear Date Filter"
                  className="flex items-center justify-center h-8 w-8 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all active:scale-95"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Daily Log Panel */}
        <DailyLogPanel />

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title={displayMetrics.revenueTitle}
            value={displayMetrics.revenue}
            trend={displayMetrics.revenueTrend}
            sparklineData={generateSparklineData(displayMetrics.revenue, 200)}
            format="currency"
            color="blue"
          />
          <MetricCard
            title={displayMetrics.profitTitle}
            value={displayMetrics.profit}
            trend={displayMetrics.profitTrend}
            subtitle={displayMetrics.profitSubtitle}
            sparklineData={generateSparklineData(displayMetrics.profit, 50)}
            format="currency"
            color="green"
          />
          <MetricCard
            title={displayMetrics.boughtTitle}
            value={displayMetrics.bought}
            subtitle={displayMetrics.boughtSubtitle}
            format="number"
            color="default"
          />
          <MetricCard
            title={displayMetrics.soldTitle}
            value={displayMetrics.sold}
            subtitle={displayMetrics.soldSubtitle}
            format="number"
            color="default"
          />
        </div>

        {/* Main Chart + Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart data={revenueChart} />
          </div>
          <div>
            <ProfitByChannelChart data={channelData} />
          </div>
        </div>

        {/* Portfolio Health + Market Movers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortfolioHealth
            totalCards={portfolioSnapshot.totalCards}
            listedCards={portfolioSnapshot.listedCards}
            unlistedCards={portfolioSnapshot.unlistedCards}
            gainingValue={portfolioSnapshot.gainingValue}
            losingValue={portfolioSnapshot.losingValue}
            agingAlerts={portfolioSnapshot.agingAlerts}
            totalCost={metrics.total_cost_basis}
            totalValue={metrics.total_inventory_value}
            totalGain={metrics.unrealized_gain}
            totalGainPct={metrics.unrealized_gain_pct}
            agingCards={portfolioSnapshot.agingCards}
          />
          <MarketMovers movers={topMovers} />
        </div>

        {/* Recent Transactions */}
        <RecentTransactions transactions={filteredTransactions} />

        {/* AI Insights Preview */}
        <AIInsightsPreview insights={aiInsights} />
      </div>
    </Shell>
  )
}
