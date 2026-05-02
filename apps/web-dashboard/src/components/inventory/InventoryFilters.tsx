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
  return (
    <>
      <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search card, set, grade, platform..."
            className="dashboard-input w-full pl-9"
          />
        </div>
        <select value={sportFilter} onChange={(event) => onSportFilterChange(event.target.value)} className="dashboard-input">
          <option value="all">All sports</option>
          {sports.map((sport) => (
            <option key={sport} value={sport}>{sport}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)} className="dashboard-input">
          <option value="all">All status</option>
          <option value="listed">Listed</option>
          <option value="unlisted">Unlisted</option>
        </select>
        <select value={ageFilter} onChange={(event) => onAgeFilterChange(event.target.value)} className="dashboard-input">
          <option value="all">All ages</option>
          <option value="fresh">0-14 days</option>
          <option value="watch">31-60 days</option>
          <option value="aging">60+ days</option>
        </select>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary">
          <Filter className="h-4 w-4" />
          Advanced filters
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-5">
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(event) => onMinPriceChange(event.target.value)}
            className="dashboard-input"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(event) => onMaxPriceChange(event.target.value)}
            className="dashboard-input"
          />
          <select
            value={profitFilter}
            onChange={(event) => onProfitFilterChange(event.target.value as ProfitFilter)}
            className="dashboard-input"
          >
            <option value="all">All P/L</option>
            <option value="profit">Profit Only</option>
            <option value="loss">Loss Only</option>
          </select>
          <select
            value={platformFilter}
            onChange={(event) => onPlatformFilterChange(event.target.value)}
            className="dashboard-input"
          >
            <option value="all">All Platforms</option>
            {platformOptions.map((platform) => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </select>
          <select
            value={gradeFilter}
            onChange={(event) => onGradeFilterChange(event.target.value)}
            className="dashboard-input"
          >
            <option value="all">All grades</option>
            {grades.map((grade) => (
              <option key={grade} value={grade}>{formatGrade(grade)}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onClearFilters}
          className="btn-outline inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm"
        >
          <X className="h-4 w-4" />
          Clear
        </button>
      </div>
    </>
  )
}
