'use client'

import { useMemo, useState } from 'react'
import Shell from '@/components/layout/Shell'
import RSLLoader from '@/components/RSLLoader'
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
  getPeriodDates,
} from '@/components/reports/reportsUtils'
import { MarginDimension, ReportPeriod } from '@/components/reports/reportsTypes'
import { useEffect } from 'react'
import { apiClient } from '@/lib/axios'

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('Monthly')
  const [marginDimension, setMarginDimension] = useState<MarginDimension>('sport')
  const [dateRange, setDateRange] = useState(() => getPeriodDates('Monthly'))

  const [isLoading, setIsLoading] = useState(true)
  const [reportData, setReportData] = useState<any>(null)

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true)
      try {
        const { data } = await apiClient.get('/v1/web-dashboard/reports', {
          params: { from: dateRange.from, to: dateRange.to }
        })
        setReportData(data)
      } catch (err) {
        console.error('Failed to fetch report data', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchReportData()
  }, [dateRange.from, dateRange.to])

  const revenueData = reportData?.revenueData || []
  const salesByPlatform = reportData?.salesByPlatform || []
  const marginData = reportData?.marginData?.[marginDimension] || []
  const agingData = reportData?.agingData || []
  const oldestCards = reportData?.oldestCards || []
  const agingAlerts = reportData?.agingAlerts || 0
  const aiInsights = reportData?.aiInsights || []

  const totalRevenue = revenueData.reduce((sum: number, item: any) => sum + item.revenue, 0)
  const totalProfit = revenueData.reduce((sum: number, item: any) => sum + item.profit, 0)
  const cardsSold = revenueData.reduce((sum: number, item: any) => sum + item.cardsSold, 0)
  
  const bestPlatform = salesByPlatform.length 
    ? salesByPlatform.reduce((best: any, item: any) => item.revenue > best.revenue ? item : best)
    : { platform: 'None', revenue: 0, profit: 0, color: '#D1D5DB' }
    
  const bestMarginGroup = marginData.length
    ? marginData.reduce((best: any, item: any) => item.margin > best.margin ? item : best)
    : { name: 'None', cards: 0, profit: 0, value: 0, margin: 0 }
    
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

        {isLoading ? (
          <div className="flex h-96 items-center justify-center rounded-2xl border border-[#252525] bg-[#0D0D0D]">
            <RSLLoader size={48} />
          </div>
        ) : (
          <>
            <ReportsMetrics
              agingAlerts={agingAlerts}
              bestPlatform={bestPlatform}
              cardsSold={cardsSold}
              margin={margin}
              period={period}
              totalProfit={totalProfit}
              totalRevenue={totalRevenue}
            />

        <div className="w-full">
          <SalesByPlatformChart salesByPlatform={salesByPlatform} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ProfitMarginAnalysis
            marginDimension={marginDimension}
            marginData={marginData}
            onMarginDimensionChange={setMarginDimension}
          />
          <InventoryAgingReport agingData={agingData} oldestCards={oldestCards} />
        </div>

        <PeriodTrend 
          revenueData={revenueData} 
          sportPerformanceData={reportData?.marginData?.sport?.slice(0, 3).map((s: any) => ({
            sport: s.name,
            profit: s.profit,
            percentage: totalProfit ? Math.round((s.profit / totalProfit) * 100) : 0
          })) || []}
        />
          </>
        )}
      </div>
    </Shell>
  )
}
