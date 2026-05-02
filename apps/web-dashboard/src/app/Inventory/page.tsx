'use client'

import { useMemo, useState } from 'react'
import Shell from '@/components/layout/Shell'
import CardDetailModal from '@/components/inventory/CardDetailModal'
import ImportToolsModal from '@/components/inventory/ImportToolsModal'
import InventoryFilters from '@/components/inventory/InventoryFilters'
import InventoryHeader from '@/components/inventory/InventoryHeader'
import InventoryMetrics from '@/components/inventory/InventoryMetrics'
import InventorySidePanel from '@/components/inventory/InventorySidePanel'
import InventoryTable from '@/components/inventory/InventoryTable'
import ListingModal from '@/components/listings/ListingModal'
import {
  formatCurrency,
  InventoryCard,
  ImportToolMode,
  ProfitFilter,
  SortDirection,
  SortKey,
} from '@/components/inventory/inventoryUtils'
import { INVENTORY_TABLE_DATA, METRICS } from '@/data/mockDashboard'

export default function InventoryPage() {
  const [query, setQuery] = useState('')
  const [sportFilter, setSportFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [ageFilter, setAgeFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('market_value')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [profitFilter, setProfitFilter] = useState<ProfitFilter>('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [activeCard, setActiveCard] = useState<InventoryCard | null>(null)
  const [importToolMode, setImportToolMode] = useState<ImportToolMode | null>(null)
  const [isListingOpen, setIsListingOpen] = useState(false)

  const sports = useMemo(
    () => Array.from(new Set(INVENTORY_TABLE_DATA.map((card) => card.sport))),
    []
  )

  const grades = useMemo(
    () => Array.from(new Set(INVENTORY_TABLE_DATA.map((card) => card.grade_key))),
    []
  )

  const filteredCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return INVENTORY_TABLE_DATA.filter((card) => {
      const searchable = [
        card.player_name,
        card.grade_key,
        card.sport,
        card.year,
        card.set_name,
        card.status,
        card.platforms_listed.join(' '),
        card.platforms_listed.length ? card.platforms_listed.join(', ') : 'not listed',
        card.cost_basis,
        formatCurrency(card.cost_basis),
        card.market_value,
        formatCurrency(card.market_value),
        card.unrealized_gain,
        `${card.unrealized_gain >= 0 ? '+' : ''}${card.unrealized_gain}`,
        formatCurrency(card.unrealized_gain),
        `${card.unrealized_gain >= 0 ? '+' : ''}${formatCurrency(card.unrealized_gain)}`,
        card.unrealized_gain_pct,
        `${card.unrealized_gain_pct >= 0 ? '+' : ''}${card.unrealized_gain_pct}%`,
        card.days_held,
        `${card.days_held} days`,
        card.comp_avg,
        formatCurrency(card.comp_avg),
        card.comp_trend,
        `${card.comp_trend >= 0 ? '+' : ''}${card.comp_trend}%`,
        card.grade_key.replace('_', ' '),
      ]
        .join(' ')
        .toLowerCase()

      const min = minPrice ? Number(minPrice) : null
      const max = maxPrice ? Number(maxPrice) : null

      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery)
      const matchesSport = sportFilter === 'all' || card.sport === sportFilter
      const matchesStatus = statusFilter === 'all' || card.status === statusFilter
      const matchesGrade = gradeFilter === 'all' || card.grade_key === gradeFilter
      const matchesAge =
        ageFilter === 'all' ||
        (ageFilter === 'fresh' && card.days_held <= 14) ||
        (ageFilter === 'aging' && card.days_held > 60) ||
        (ageFilter === 'watch' && card.days_held > 30 && card.days_held <= 60)
      const matchesPrice =
        (!min || card.market_value >= min) &&
        (!max || card.market_value <= max)
      const matchesProfit =
        profitFilter === 'all' ||
        (profitFilter === 'profit' && card.unrealized_gain > 0) ||
        (profitFilter === 'loss' && card.unrealized_gain < 0)
      const matchesPlatform =
        platformFilter === 'all' ||
        card.platforms_listed.includes(platformFilter)

      return (
        matchesQuery &&
        matchesSport &&
        matchesStatus &&
        matchesGrade &&
        matchesAge &&
        matchesPrice &&
        matchesProfit &&
        matchesPlatform
      )
    }).sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1
      const getValue = (card: InventoryCard) => {
        if (sortKey === 'platforms_listed') return card.platforms_listed.length
        return card[sortKey]
      }
      const aValue = getValue(a)
      const bValue = getValue(b)

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * direction
      }

      return String(aValue).localeCompare(String(bValue)) * direction
    })
  }, [
    ageFilter,
    gradeFilter,
    maxPrice,
    minPrice,
    platformFilter,
    profitFilter,
    query,
    sortDirection,
    sortKey,
    sportFilter,
    statusFilter,
  ])

  const agingCards = filteredCards.filter((card) => card.days_held > 60)
  const listedCards = filteredCards.filter((card) => card.status === 'listed').length
  const selectedCards = filteredCards.filter((card) => selectedIds.includes(card.id))
  const filteredValue = filteredCards.reduce((sum, card) => sum + card.market_value, 0)
  const filteredGain = filteredCards.reduce((sum, card) => sum + card.unrealized_gain, 0)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(key)
    setSortDirection('asc')
  }

  const toggleSelected = (cardId: string) => {
    setSelectedIds((current) =>
      current.includes(cardId)
        ? current.filter((id) => id !== cardId)
        : [...current, cardId]
    )
  }

  const toggleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === filteredCards.length ? [] : filteredCards.map((card) => card.id)
    )
  }

  const clearFilters = () => {
    setQuery('')
    setSportFilter('all')
    setStatusFilter('all')
    setGradeFilter('all')
    setAgeFilter('all')
    setMinPrice('')
    setMaxPrice('')
    setProfitFilter('all')
    setPlatformFilter('all')
  }

  return (
    <Shell>
      <div className="space-y-6">
        <InventoryHeader onOpenImportTool={setImportToolMode} />

        <InventoryMetrics
          agingCount={agingCards.length}
          filteredCount={filteredCards.length}
          filteredGain={filteredGain}
          filteredValue={filteredValue}
          listedCount={listedCards}
          totalPortfolioValue={METRICS.total_inventory_value}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <InventoryTable
            cards={filteredCards}
            selectedCount={selectedCards.length}
            selectedIds={selectedIds}
            sortDirection={sortDirection}
            sortKey={sortKey}
            onCardDetail={setActiveCard}
            onListAll={() => setIsListingOpen(true)}
            onSelectAll={toggleSelectAll}
            onSort={toggleSort}
            onToggleSelected={toggleSelected}
          >
            <InventoryFilters
              ageFilter={ageFilter}
              gradeFilter={gradeFilter}
              grades={grades}
              maxPrice={maxPrice}
              minPrice={minPrice}
              platformFilter={platformFilter}
              profitFilter={profitFilter}
              query={query}
              sportFilter={sportFilter}
              sports={sports}
              statusFilter={statusFilter}
              onAgeFilterChange={setAgeFilter}
              onClearFilters={clearFilters}
              onGradeFilterChange={setGradeFilter}
              onMaxPriceChange={setMaxPrice}
              onMinPriceChange={setMinPrice}
              onPlatformFilterChange={setPlatformFilter}
              onProfitFilterChange={setProfitFilter}
              onQueryChange={setQuery}
              onSportFilterChange={setSportFilter}
              onStatusFilterChange={setStatusFilter}
            />
          </InventoryTable>

          <InventorySidePanel
            agingCards={agingCards}
            onCardDetail={setActiveCard}
            onOpenImportTool={setImportToolMode}
          />
        </div>
      </div>

      {activeCard && (
        <CardDetailModal card={activeCard} onClose={() => setActiveCard(null)} />
      )}

      {importToolMode && (
        <ImportToolsModal
          initialMode={importToolMode}
          onClose={() => setImportToolMode(null)}
        />
      )}

      {isListingOpen && (
        <ListingModal
          selectedCards={selectedCards}
          onClose={() => setIsListingOpen(false)}
        />
      )}
    </Shell>
  )
}
