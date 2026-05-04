'use client'

import { useMemo, useState } from 'react'
import Shell from '@/components/layout/Shell'
import AISummary from '@/components/reports/AISummary'
import InventoryAgingReport from '@/components/reports/InventoryAgingReport'
import PeriodTrend from '@/components/reports/PeriodTrend'
import ProfitMarginAnalysis from '@/components/reports/ProfitMarginAnalysis'
import ReportsControls from '@/components/reports/ReportsControls'
import ReportsHeader from '@/components/reports/ReportsHeader'
import ReportsMetrics from '@/components/reports/ReportsMetrics'
import SalesByPlatformChart from '@/components/reports/SalesByPlatformChart'
import {
  buildReportCsv,
  exportCsv,
  exportPdf,
  getAgingReport,
  getMarginData,
  getOldestCards,
  getPeriodDates,
  getSalesByPlatform,
  normalizeRevenueData,
} from '@/components/reports/reportsUtils'
import { MarginDimension, ReportPeriod } from '@/components/reports/reportsTypes'
import {
  AI_INSIGHTS,
  INVENTORY_TABLE_DATA,
  REVENUE_CHART_DATA,
  SPORT_PERFORMANCE_DATA,
} from '@/data/mockDashboard'

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('Monthly')
  const [marginDimension, setMarginDimension] = useState<MarginDimension>('sport')
  const [dateRange, setDateRange] = useState(() => getPeriodDates('Monthly'))

  const revenueData = useMemo(() => normalizeRevenueData(REVENUE_CHART_DATA), [])

  const filteredRevenueData = useMemo(
    () =>
      revenueData.filter((item) => {
        const date = item.isoDate
        return date >= dateRange.from && date <= dateRange.to
      }),
    [dateRange.from, dateRange.to, revenueData]
  )

  const salesByPlatform = useMemo(
    () => getSalesByPlatform(filteredRevenueData),
    [filteredRevenueData]
  )

  const marginData = useMemo(
    () => getMarginData(marginDimension, salesByPlatform),
    [marginDimension, salesByPlatform]
  )

  const agingData = useMemo(() => getAgingReport(INVENTORY_TABLE_DATA), [])
  const oldestCards = useMemo(() => getOldestCards(INVENTORY_TABLE_DATA), [])

  const totalRevenue = filteredRevenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalProfit = filteredRevenueData.reduce((sum, item) => sum + item.profit, 0)
  const cardsSold = Math.max(0, Math.round(filteredRevenueData.length * 3.8))
  const bestPlatform = salesByPlatform.reduce((best, item) =>
    item.revenue > best.revenue ? item : best
  )
  const bestMarginGroup = marginData.reduce((best, item) =>
    item.margin > best.margin ? item : best
  )
  const agingAlerts = INVENTORY_TABLE_DATA.filter((card) => card.days_held > 60).length
  const margin = totalRevenue ? (totalProfit / totalRevenue) * 100 : 0

  const handlePeriodChange = (nextPeriod: ReportPeriod) => {
    setPeriod(nextPeriod)
    setDateRange(getPeriodDates(nextPeriod, dateRange))
  }

  const handleExportCsv = () => {
    exportCsv(
      `rsl-${period.toLowerCase()}-report-${dateRange.from}-to-${dateRange.to}.csv`,
      buildReportCsv({
        agingData,
        bestMarginGroup,
        bestPlatform,
        cardsSold,
        dateRange,
        margin,
        marginData,
        period,
        salesByPlatform,
        totalProfit,
        totalRevenue,
      })
    )
  }

  const handleExportPdf = () => {
    exportPdf({
      agingAlerts,
      bestMarginGroup,
      bestPlatform,
      cardsSold,
      dateRange,
      margin,
      period,
      salesByPlatform,
      totalProfit,
      totalRevenue,
    })
  }

  return (
    <Shell>
      <div className="space-y-6">
        <ReportsHeader onExportCsv={handleExportCsv} onExportPdf={handleExportPdf} />

        <ReportsControls
          dateRange={dateRange}
          period={period}
          onDateRangeChange={(nextRange) => {
            setPeriod('Custom')
            setDateRange(nextRange)
          }}
          onPeriodChange={handlePeriodChange}
        />

        <ReportsMetrics
          agingAlerts={agingAlerts}
          bestPlatform={bestPlatform}
          cardsSold={cardsSold}
          margin={margin}
          period={period}
          totalProfit={totalProfit}
          totalRevenue={totalRevenue}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <SalesByPlatformChart salesByPlatform={salesByPlatform} />
          <AISummary
            agingAlerts={agingAlerts}
            bestMarginGroup={bestMarginGroup}
            bestPlatform={bestPlatform}
            insights={AI_INSIGHTS}
            period={period}
            totalProfit={totalProfit}
            totalRevenue={totalRevenue}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ProfitMarginAnalysis
            marginData={marginData}
            marginDimension={marginDimension}
            onMarginDimensionChange={setMarginDimension}
          />
          <InventoryAgingReport agingData={agingData} oldestCards={oldestCards} />
        </div>

        <PeriodTrend
          revenueData={filteredRevenueData}
          sportPerformanceData={SPORT_PERFORMANCE_DATA}
        />
      </div>
    </Shell>
  )
}
