import { Search, SlidersHorizontal } from 'lucide-react'
import { InsightType, RecommendationFilter } from './aiInsightsTypes'

interface AIInsightsFiltersProps {
  minConfidence: number
  query: string
  recommendationFilter: RecommendationFilter
  sportFilter: string
  sports: string[]
  typeFilter: InsightType
  onMinConfidenceChange: (value: number) => void
  onQueryChange: (value: string) => void
  onRecommendationFilterChange: (value: RecommendationFilter) => void
  onSportFilterChange: (value: string) => void
  onTypeFilterChange: (value: InsightType) => void
}

export default function AIInsightsFilters({
  minConfidence,
  query,
  recommendationFilter,
  sportFilter,
  sports,
  typeFilter,
  onMinConfidenceChange,
  onQueryChange,
  onRecommendationFilterChange,
  onSportFilterChange,
  onTypeFilterChange,
}: AIInsightsFiltersProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-500">
        <SlidersHorizontal className="h-4 w-4" />
        Insight Filters
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 w-full pl-9"
            placeholder="Search player, sport, recommendation"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(event) => onTypeFilterChange(event.target.value as InsightType)}
          className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
        >
          <option value="all">All Signal Types</option>
          <option value="BREAKOUT">Breakout</option>
          <option value="MOMENTUM">Momentum</option>
          <option value="DECLINE">Decline</option>
        </select>
        <select
          value={sportFilter}
          onChange={(event) => onSportFilterChange(event.target.value)}
          className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
        >
          <option value="all">All Sports</option>
          {sports.map((sport) => (
            <option key={sport} value={sport}>{sport}</option>
          ))}
        </select>
        <select
          value={recommendationFilter}
          onChange={(event) =>
            onRecommendationFilterChange(event.target.value as RecommendationFilter)
          }
          className="block w-full rounded-lg border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
        >
          <option value="all">All Recommendations</option>
          <option value="HOLD">Hold</option>
          <option value="SELL">Sell</option>
          <option value="BUY">Buy</option>
        </select>
      </div>

      <div className="mt-4 flex flex-col gap-2 text-sm text-gray-500 md:flex-row md:items-center">
        <label className="flex items-center gap-3">
          Confidence
          <input
            type="range"
            min="70"
            max="95"
            value={minConfidence}
            onChange={(event) => onMinConfidenceChange(Number(event.target.value))}
            className="w-56 accent-accent-blue"
          />
          <span className="font-mono text-gray-900">{minConfidence}%+</span>
        </label>
      </div>
    </div>
  )
}
