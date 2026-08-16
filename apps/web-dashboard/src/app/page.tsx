'use client'

import { useEffect, useState, useMemo } from 'react'
import { Calendar, Filter, X, ArrowRight } from 'lucide-react'
import Shell from '@/components/layout/Shell'
import RSLLoader from '@/components/RSLLoader'
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

import ActionCenter from '@/components/dashboard/ActionCenter'
import Link from 'next/link'
import { Plus, ArrowUpRight } from 'lucide-react'

const getLocalYMD = (d = new Date()) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function DashboardPage() {
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const [dateFrom, setDateFrom] = useState(() => getLocalYMD())
  const [dateTo, setDateTo] = useState(() => getLocalYMD())
  const [activePreset, setActivePreset] = useState<'today' | '7d' | '30d' | 'custom'>('today')
  const [isFilterActive, setIsFilterActive] = useState(true)

  const { data: metrics, isLoading: isMetricsLoading, error: metricsError } = useDashboardMetrics(isFilterActive ? dateFrom : undefined, isFilterActive ? dateTo : undefined)
  const { data: revenueChart, isLoading: isRevLoading } = useRevenueChart(isFilterActive ? dateFrom : undefined, isFilterActive ? dateTo : undefined)
  const { data: recentTransactions, isLoading: isTxLoading } = useRecentTransactions(isFilterActive ? dateFrom : undefined, isFilterActive ? dateTo : undefined)
  const { data: portfolioSnapshot, isLoading: isPortfolioLoading } = usePortfolioSnapshot()

  const filteredTransactions = useMemo(() => {
    return (recentTransactions || []).slice(0, 5)
  }, [recentTransactions])

  const displayMetrics = useMemo(() => {
    const isToday = activePreset === 'today'
    return {
      revenueTitle: isToday ? "Today's Revenue" : "Period Revenue",
      revenue: metrics?.today?.revenue || 0,
      revenueTrend: isToday ? { value: metrics?.today?.revenue_change || 0, label: 'vs yesterday' } : undefined,
      profitTitle: isToday ? "Today's Gross Profit" : "Period Gross Profit",
      profit: metrics?.today?.profit || 0,
      profitTrend: isToday ? { value: metrics?.today?.profit_change || 0, label: 'vs yesterday' } : undefined,
      profitSubtitle: `${(metrics?.today?.margin || 0).toFixed(1)}% margin`,
      inventoryValueTitle: "Total Inventory Value",
      inventoryValue: metrics?.total_inventory_value || 0,
      inventorySubtitle: `${metrics?.total_cost_basis ? `$${metrics.total_cost_basis.toLocaleString()} cost basis` : 'Live market valuation'}`,
      cardsSoldTitle: isToday ? "Cards Sold Today" : "Period Cards Sold",
      cardsSold: metrics?.today?.cards_sold || 0,
      cardsSoldSubtitle: `${metrics?.today?.cards_bought || 0} cards bought in period`,
    }
  }, [metrics, activePreset])

  const isLoading =
    !isHydrated ||
    isMetricsLoading ||
    isRevLoading ||
    isTxLoading ||
    isPortfolioLoading

  const error = metricsError ? (metricsError as Error).message : null

  if (!isHydrated || (isLoading && isAuthenticated)) {
    return (
      <Shell>
        <div className="flex h-64 items-center justify-center">
          <RSLLoader size={48} />
        </div>
      </Shell>
    )
  }

  if (error) {
    return (
      <Shell>
        <div className="flex h-64 items-center justify-center">
          <div className="text-sm text-red-400">{error}</div>
        </div>
      </Shell>
    )
  }

  if (!isAuthenticated || !metrics || !revenueChart || !recentTransactions || !portfolioSnapshot) return null

  const generateSparklineData = (baseValue: number, variance: number) => {
    return Array.from({ length: 7 }, () =>
      baseValue + (Math.random() - 0.5) * variance
    )
  }

  const handleApplyPreset = (preset: 'today' | '7d' | '30d') => {
    setActivePreset(preset)
    const end = new Date()
    const start = new Date()
    if (preset === 'today') {
      // today
    } else if (preset === '7d') {
      start.setDate(start.getDate() - 7)
    } else if (preset === '30d') {
      start.setDate(start.getDate() - 30)
    }
    setDateFrom(getLocalYMD(start))
    setDateTo(getLocalYMD(end))
    setIsFilterActive(true)
  }

  return (
    <Shell>
      <div className="space-y-5 max-w-7xl mx-auto">
        {/* Compact Command Bar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D0D0D] border border-[#252525] p-4 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Dealer Command Center</h1>
            <p className="text-xs text-zinc-400 mt-0.5">Real-time business performance and quick operating actions.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Compact Global Date Selector */}
            <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-xl border border-[#252525]">
              {(['today', '7d', '30d'] as const).map((preset) => {
                const labels: Record<string, string> = { today: 'Today', '7d': '7 Days', '30d': '30 Days' }
                return (
                  <button
                    key={preset}
                    onClick={() => handleApplyPreset(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activePreset === preset
                      ? 'bg-[#E8001C] text-white font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                      }`}
                  >
                    {labels[preset]}
                  </button>
                )
              })}
            </div>

            {/* Quick Actions Header Buttons */}
            <Link
              href="/inventory/add"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#E8001C] hover:bg-[#CC0018] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Card / Purchase
            </Link>

            <Link
              href="/transactions"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#252525] bg-[#141414] hover:bg-[#1A1A1A] px-3.5 py-2 text-xs font-bold text-white transition"
            >
              Record Sale
            </Link>
          </div>
        </div>

        {/* Daily Log Status Indicator */}
        <DailyLogPanel />

        {/* Primary Metrics Row (4 Core Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
            title={displayMetrics.inventoryValueTitle}
            value={displayMetrics.inventoryValue}
            subtitle={displayMetrics.inventorySubtitle}
            format="currency"
            color="default"
          />
          <MetricCard
            title={displayMetrics.cardsSoldTitle}
            value={displayMetrics.cardsSold}
            subtitle={displayMetrics.cardsSoldSubtitle}
            format="number"
            color="default"
          />
        </div>

        {/* Main Grid: Revenue & Profit Chart + Action Center */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <RevenueChart data={revenueChart} />
          </div>
          <div>
            <ActionCenter
              agingCount={portfolioSnapshot.agingAlerts}
              unlistedCount={portfolioSnapshot.unlistedCards}
            />
          </div>
        </div>

        {/* Recent Activity (Latest 3-5 Transactions) */}
        <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#252525] pb-3 mb-4">
            <div>
              <h3 className="font-bold text-base text-white">Recent Activity</h3>
              <p className="text-xs text-zinc-400">Latest recorded purchases and sales</p>
            </div>
            <Link
              href="/transactions"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#E8001C] hover:text-red-400 transition-colors"
            >
              View Full Transaction History
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <RecentTransactions transactions={filteredTransactions} />
        </div>

        {/* 
          Phase 1 Excluded Components (Commented Out for Future Phases):
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PortfolioHealth ... />
            <MarketMovers ... />
          </div>
          <AIInsightsPreview ... />
          <ProfitByChannelChart ... />
        */}
      </div>
    </Shell>
  )
}
