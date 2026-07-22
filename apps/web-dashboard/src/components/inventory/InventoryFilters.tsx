import { Filter, Search, X } from 'lucide-react'
import { formatGrade, platformOptions, ProfitFilter } from './inventoryUtils'

interface InventoryFiltersProps {
  ageFilter: string
  gradeFilter: string
  grades: string[]
  maxPrice: string
  minPrice: string
  platformFilter: string
  profitFilter: ProfitFilter
  query: string
  sportFilter: string
  sports: string[]
  statusFilter: string
  onAgeFilterChange: (value: string) => void
  onClearFilters: () => void
  onGradeFilterChange: (value: string) => void
  onMaxPriceChange: (value: string) => void
  onMinPriceChange: (value: string) => void
  onPlatformFilterChange: (value: string) => void
  onProfitFilterChange: (value: ProfitFilter) => void
  onQueryChange: (value: string) => void
  onSportFilterChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
}

export default function InventoryFilters({
  ageFilter,
  gradeFilter,
  grades,
  maxPrice,
  minPrice,
  platformFilter,
  profitFilter,
  query,
  sportFilter,
  sports,
  statusFilter,
  onAgeFilterChange,
  onClearFilters,
  onGradeFilterChange,
  onMaxPriceChange,
  onMinPriceChange,
  onPlatformFilterChange,
  onProfitFilterChange,
  onQueryChange,
  onSportFilterChange,
  onStatusFilterChange,
}: InventoryFiltersProps) {
  const inputClass =
    'h-11 w-full rounded-xl border border-[#252525] bg-[#141414] px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#E8001C] focus:ring-1 focus:ring-[#E8001C]/20'
  const selectClass = `${inputClass} appearance-none cursor-pointer`

  return (
    <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search card, set, grade, platform..."
            className={`${inputClass} pl-9`}
          />
        </div>
        <select value={sportFilter} onChange={(event) => onSportFilterChange(event.target.value)} className={selectClass}>
          <option value="all" className="bg-[#141414] text-white">All sports</option>
          {sports.map((sport) => (
            <option key={sport} value={sport} className="bg-[#141414] text-white">{sport}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)} className={selectClass}>
          <option value="all" className="bg-[#141414] text-white">All status</option>
          <option value="listed" className="bg-[#141414] text-white">Listed</option>
          <option value="unlisted" className="bg-[#141414] text-white">Unlisted</option>
        </select>
        <select value={ageFilter} onChange={(event) => onAgeFilterChange(event.target.value)} className={selectClass}>
          <option value="all" className="bg-[#141414] text-white">All ages</option>
          <option value="fresh" className="bg-[#141414] text-white">0-14 days</option>
          <option value="watch" className="bg-[#141414] text-white">31-60 days</option>
          <option value="aging" className="bg-[#141414] text-white">60+ days</option>
        </select>
      </div>

      <div className="mt-4 flex flex-wrap items-start gap-3">
        <div className="inline-flex h-11 items-center gap-2 text-sm font-medium text-zinc-400">
          <Filter className="h-4 w-4" />
          Advanced filters
        </div>
        <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-5">
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(event) => onMinPriceChange(event.target.value)}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(event) => onMaxPriceChange(event.target.value)}
            className={inputClass}
          />
          <select
            value={profitFilter}
            onChange={(event) => onProfitFilterChange(event.target.value as ProfitFilter)}
            className={selectClass}
          >
            <option value="all" className="bg-[#141414] text-white">All P/L</option>
            <option value="profit" className="bg-[#141414] text-white">Profit Only</option>
            <option value="loss" className="bg-[#141414] text-white">Loss Only</option>
          </select>
          <select
            value={platformFilter}
            onChange={(event) => onPlatformFilterChange(event.target.value)}
            className={selectClass}
          >
            <option value="all" className="bg-[#141414] text-white">All Platforms</option>
            {platformOptions.map((platform) => (
              <option key={platform} value={platform} className="bg-[#141414] text-white">{platform}</option>
            ))}
          </select>
          <select
            value={gradeFilter}
            onChange={(event) => onGradeFilterChange(event.target.value)}
            className={selectClass}
          >
            <option value="all" className="bg-[#141414] text-white">All grades</option>
            {grades.map((grade) => (
              <option key={grade} value={grade} className="bg-[#141414] text-white">{formatGrade(grade)}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#252525] bg-[#141414] px-3 text-sm font-semibold text-zinc-300 shadow-sm transition hover:bg-[#1A1A1A] hover:text-white"
        >
          <X className="h-4 w-4" />
          Clear
        </button>
      </div>
    </div>
  )
}
