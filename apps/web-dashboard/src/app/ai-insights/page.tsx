'use client'

import { useMemo, useState } from 'react'
import ActionQueue from '@/components/ai-insights/ActionQueue'
import AIInsightCharts from '@/components/ai-insights/AIInsightCharts'
import AIInsightsFilters from '@/components/ai-insights/AIInsightsFilters'
import AIInsightsHeader from '@/components/ai-insights/AIInsightsHeader'
import AIInsightsMetrics from '@/components/ai-insights/AIInsightsMetrics'
import MoverWatchlist from '@/components/ai-insights/MoverWatchlist'
import SelectedInsightPanel from '@/components/ai-insights/SelectedInsightPanel'
import SignalFeed from '@/components/ai-insights/SignalFeed'
import { InsightType, RecommendationFilter } from '@/components/ai-insights/aiInsightsTypes'
import { insightConfidence, insightUrgency } from '@/components/ai-insights/aiInsightsUtils'
import Shell from '@/components/layout/Shell'
import { useAiInsights, useTopMovers, useAffectedInventory, useCompHistory, useSportProfitMix } from '@/hooks/dashboard/useDashboard'
import { AlertCircle } from 'lucide-react'

export default function AIInsightsPage() {
  const { data: insightsData, isLoading: insightsLoading } = useAiInsights()
  const { data: moversData, isLoading: moversLoading } = useTopMovers()
  const { data: sportProfitMixData } = useSportProfitMix()

  const insights = useMemo(() => insightsData || [], [insightsData])
  const movers = useMemo(() => moversData || [], [moversData])

  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<InsightType>('all')
  const [sportFilter, setSportFilter] = useState('all')
  const [recommendationFilter, setRecommendationFilter] = useState<RecommendationFilter>('all')
  const [minConfidence, setMinConfidence] = useState(80)
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [selectedInsightId, setSelectedInsightId] = useState('')
  const [completedActions, setCompletedActions] = useState<string[]>([])

  const sports = useMemo(
    () => Array.from(new Set(insights.map((insight) => insight.sport))),
    [insights]
  )

  const filteredInsights = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return insights.filter((insight) => {
      const confidence = insightConfidence[insight.id] ?? 80
      const searchable = [
        insight.player,
        insight.sport,
        insight.type,
        insight.headline,
        insight.body,
        insight.recommendation,
        insight.price_change,
        insight.price_range,
      ]
        .join(' ')
        .toLowerCase()

      return (
        (typeFilter === 'all' || insight.type === typeFilter) &&
        (sportFilter === 'all' || insight.sport === sportFilter) &&
        (recommendationFilter === 'all' || insight.recommendation === recommendationFilter) &&
        confidence >= minConfidence &&
        (!normalizedQuery || searchable.includes(normalizedQuery))
      )
    })
  }, [insights, minConfidence, query, recommendationFilter, sportFilter, typeFilter])

  const selectedInsight = useMemo(() => {
    return (
      insights.find((insight) => insight.id === selectedInsightId) ??
      filteredInsights[0] ??
      insights[0]
    )
  }, [insights, selectedInsightId, filteredInsights])

  const { data: affectedInventoryData } = useAffectedInventory(selectedInsight?.player ?? '')
  const affectedInventory = useMemo(() => affectedInventoryData || [], [affectedInventoryData])

  const { data: compHistoryData } = useCompHistory(selectedInsight?.id ?? '')

  const matchedMovers = useMemo(
    () =>
      movers.filter((mover) =>
        insights.some((insight) =>
          insight.player.toLowerCase().includes(mover.player.toLowerCase())
        )
      ),
    [insights, movers]
  )

  const metrics = useMemo(() => {
    const highConfidence = insights.filter(
      (insight) => (insightConfidence[insight.id] ?? 80) >= 90
    ).length
    const inventoryAtRisk = affectedInventory.filter(
      (card) => card.unrealized_gain < 0 || card.days_held > 60
    ).length
    const upsideValue = affectedInventory.filter((card) => card.comp_trend > 0).reduce(
      (sum, card) => sum + card.market_value,
      0
    )

    return {
      highConfidence,
      inventoryAtRisk,
      upsideValue,
      activeAlerts: insights.length + movers.length,
    }
  }, [insights, movers, affectedInventory])

  const actionQueue = useMemo(
    () =>
      insights.map((insight) => ({
        id: insight.id,
        player: insight.player,
        action:
          insight.recommendation === 'SELL'
            ? 'Create listing and compare platform fees'
            : insight.type === 'BREAKOUT'
              ? 'Review comps before changing ask price'
              : 'Keep card in watchlist and monitor next comp update',
        priority:
          insight.type === 'DECLINE'
            ? 'High' as const
            : insight.type === 'BREAKOUT'
              ? 'Medium' as const
              : 'Low' as const,
        due: insightUrgency[insight.id] ?? 'This week',
      })),
    [insights]
  )

  const toggleAction = (actionId: string) => {
    setCompletedActions((current) =>
      current.includes(actionId)
        ? current.filter((id) => id !== actionId)
        : [...current, actionId]
    )
  }

  if (insightsLoading || moversLoading) {
    return (
      <Shell>
        <div className="flex h-[50vh] items-center justify-center">
          <p className="text-gray-500">Loading RSL insights and market data...</p>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="space-y-6">
        <AIInsightsHeader
          alertsEnabled={alertsEnabled}
          onToggleAlerts={() => setAlertsEnabled((current) => !current)}
        />

        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-800 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <span className="font-semibold">Disclaimer:</span> This information is gathered from market signals and may not be 100% accurate. It is presented as-is for informational purposes.
          </div>
        </div>

        <AIInsightsMetrics metrics={metrics} />

        <AIInsightsFilters
          minConfidence={minConfidence}
          query={query}
          recommendationFilter={recommendationFilter}
          sportFilter={sportFilter}
          sports={sports}
          typeFilter={typeFilter}
          onMinConfidenceChange={setMinConfidence}
          onQueryChange={setQuery}
          onRecommendationFilterChange={setRecommendationFilter}
          onSportFilterChange={setSportFilter}
          onTypeFilterChange={setTypeFilter}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <SignalFeed
            insights={filteredInsights}
            selectedInsightId={selectedInsight?.id ?? ''}
            onSelectInsight={setSelectedInsightId}
          />

          <SelectedInsightPanel
            affectedInventory={affectedInventory}
            selectedInsight={selectedInsight}
          />
        </div>

        <AIInsightCharts compHistory={compHistoryData} sportProfitMix={sportProfitMixData} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ActionQueue
            actions={actionQueue}
            completedActions={completedActions}
            onToggleAction={toggleAction}
          />

          <MoverWatchlist matchedMovers={matchedMovers} movers={movers} />
        </div>
      </div>
    </Shell>
  )
}
