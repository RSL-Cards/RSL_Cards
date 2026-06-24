'use client'

import { useEffect, useState } from 'react'
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

export default function DashboardPage() {
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  const { data: metrics, isLoading: isMetricsLoading, error: metricsError } = useDashboardMetrics()
  const { data: revenueChart, isLoading: isRevLoading } = useRevenueChart()
  const { data: channelData, isLoading: isChannelLoading } = useChannelData()
  const { data: inventory, isLoading: isInvLoading } = useDashboardInventory()
  const { data: topMovers, isLoading: isMoversLoading } = useTopMovers()
  const { data: recentTransactions, isLoading: isTxLoading } = useRecentTransactions()
  const { data: aiInsights, isLoading: isAiLoading } = useAiInsights()
  const { data: portfolioSnapshot, isLoading: isPortfolioLoading } = usePortfolioSnapshot()

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

  return (
    <Shell>
      <div className="space-y-6">
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Today's Revenue"
            value={metrics.today.revenue}
            trend={{ value: 14.2, label: 'vs yesterday' }}
            sparklineData={generateSparklineData(metrics.today.revenue, 200)}
            format="currency"
            color="blue"
          />
          <MetricCard
            title="Today's Profit"
            value={metrics.today.profit}
            trend={{ value: 8.4, label: 'vs yesterday' }}
            subtitle={`${metrics.today.margin.toFixed(1)}% margin`}
            sparklineData={generateSparklineData(metrics.today.profit, 50)}
            format="currency"
            color="green"
          />
          <MetricCard
            title="Cards Bought Today"
            value={metrics.today.cards_bought}
             subtitle={`${metrics.today.cards_sold} sold, net ${metrics.today.cards_bought - metrics.today.cards_sold} cards`}
            format="number"
            color="default"
          />
          <MetricCard
            title="Cards Sold Today"
            value={metrics.today.cards_sold}
            subtitle={`${metrics.today.cards_bought} bought, net ${metrics.today.cards_sold - metrics.today.cards_bought} card`}
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
        <RecentTransactions transactions={recentTransactions} />

        {/* AI Insights Preview */}
        <AIInsightsPreview insights={aiInsights} />
      </div>
    </Shell>
  )
}
