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
import { AI_INSIGHTS, INVENTORY_TABLE_DATA, TOP_MOVERS } from '@/data/mockDashboard'

export default function AIInsightsPage() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<InsightType>('all')
  const [sportFilter, setSportFilter] = useState('all')
  const [recommendationFilter, setRecommendationFilter] = useState<RecommendationFilter>('all')
  const [minConfidence, setMinConfidence] = useState(80)
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const [selectedInsightId, setSelectedInsightId] = useState(AI_INSIGHTS[0]?.id ?? '')
  const [completedActions, setCompletedActions] = useState<string[]>([])

  const sports = useMemo(
    () => Array.from(new Set(AI_INSIGHTS.map((insight) => insight.sport))),
    []
  )

  const filteredInsights = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return AI_INSIGHTS.filter((insight) => {
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
  }, [minConfidence, query, recommendationFilter, sportFilter, typeFilter])

  const selectedInsight =
    AI_INSIGHTS.find((insight) => insight.id === selectedInsightId) ??
    filteredInsights[0] ??
    AI_INSIGHTS[0]

  const affectedInventory = useMemo(() => {
    if (!selectedInsight) return []
    const playerName = selectedInsight.player.toLowerCase()

    return INVENTORY_TABLE_DATA.filter((card) =>
      playerName.includes(card.player_name.toLowerCase()) ||
      card.player_name.toLowerCase().includes(playerName.split(' ')[0])
    )
  }, [selectedInsight])

  const matchedMovers = useMemo(
    () =>
      TOP_MOVERS.filter((mover) =>
        AI_INSIGHTS.some((insight) =>
          insight.player.toLowerCase().includes(mover.player.toLowerCase())
        )
      ),
    []
  )

  const metrics = useMemo(() => {
    const highConfidence = AI_INSIGHTS.filter(
      (insight) => (insightConfidence[insight.id] ?? 80) >= 90
    ).length
    const inventoryAtRisk = INVENTORY_TABLE_DATA.filter(
      (card) => card.unrealized_gain < 0 || card.days_held > 60
    ).length
    const upsideValue = INVENTORY_TABLE_DATA.filter((card) => card.comp_trend > 0).reduce(
      (sum, card) => sum + card.market_value,
      0
    )

    return {
      highConfidence,
      inventoryAtRisk,
      upsideValue,
      activeAlerts: AI_INSIGHTS.length + TOP_MOVERS.length,
    }
  }, [])

  const actionQueue = useMemo(
    () =>
      AI_INSIGHTS.map((insight) => ({
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
    []
  )

  const toggleAction = (actionId: string) => {
    setCompletedActions((current) =>
      current.includes(actionId)
        ? current.filter((id) => id !== actionId)
        : [...current, actionId]
    )
  }

  return (
    <Shell>
      <div className="space-y-6">
        <AIInsightsHeader
          alertsEnabled={alertsEnabled}
          onToggleAlerts={() => setAlertsEnabled((current) => !current)}
        />

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

        <AIInsightCharts />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ActionQueue
            actions={actionQueue}
            completedActions={completedActions}
            onToggleAction={toggleAction}
          />

          <MoverWatchlist matchedMovers={matchedMovers} movers={TOP_MOVERS} />
        </div>
      </div>
    </Shell>
  )
}
