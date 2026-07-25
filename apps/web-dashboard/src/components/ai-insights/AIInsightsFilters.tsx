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
    <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-400">
        <SlidersHorizontal className="h-4 w-4" />
        Insight Filters
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="block w-full rounded-lg border border-[#252525] bg-[#141414] py-2 px-3 text-white shadow-sm placeholder:text-zinc-500 focus:border-[#E8001C] focus:outline-none sm:text-sm sm:leading-6 w-full pl-9"
            placeholder="Search player, sport, recommendation"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(event) => onTypeFilterChange(event.target.value as InsightType)}
          className="block w-full rounded-lg border border-[#252525] bg-[#141414] py-2 px-3 text-white shadow-sm focus:border-[#E8001C] focus:outline-none sm:text-sm sm:leading-6"
        >
          <option value="all" className="bg-[#141414] text-white">All Signal Types</option>
          <option value="BREAKOUT" className="bg-[#141414] text-white">Breakout</option>
          <option value="MOMENTUM" className="bg-[#141414] text-white">Momentum</option>
          <option value="DECLINE" className="bg-[#141414] text-white">Decline</option>
        </select>
        <select
          value={sportFilter}
          onChange={(event) => onSportFilterChange(event.target.value)}
          className="block w-full rounded-lg border border-[#252525] bg-[#141414] py-2 px-3 text-white shadow-sm focus:border-[#E8001C] focus:outline-none sm:text-sm sm:leading-6"
        >
          <option value="all" className="bg-[#141414] text-white">All Sports</option>
          {sports.map((sport) => (
            <option key={sport} value={sport} className="bg-[#141414] text-white">{sport}</option>
          ))}
        </select>
        <select
          value={recommendationFilter}
          onChange={(event) =>
            onRecommendationFilterChange(event.target.value as RecommendationFilter)
          }
          className="block w-full rounded-lg border border-[#252525] bg-[#141414] py-2 px-3 text-white shadow-sm focus:border-[#E8001C] focus:outline-none sm:text-sm sm:leading-6"
        >
          <option value="all" className="bg-[#141414] text-white">All Recommendations</option>
          <option value="HOLD" className="bg-[#141414] text-white">Hold</option>
          <option value="SELL" className="bg-[#141414] text-white">Sell</option>
          <option value="BUY" className="bg-[#141414] text-white">Buy</option>
        </select>
      </div>

      <div className="mt-4 flex flex-col gap-2 text-sm text-zinc-400 md:flex-row md:items-center">
        <label className="flex items-center gap-3">
          Confidence
          <input
            type="range"
            min="70"
            max="95"
            value={minConfidence}
            onChange={(event) => onMinConfidenceChange(Number(event.target.value))}
            className="w-56 accent-[#E8001C]"
          />
          <span className="font-mono text-white">{minConfidence}%+</span>
        </label>
      </div>
    </div>
  )
}
