'use client'

import { useEffect, useMemo, useState } from 'react'
import Shell from '@/components/layout/Shell'
import CardDetailModal from '@/components/inventory/CardDetailModal'
import ImportToolsModal from '@/components/inventory/ImportToolsModal'
import InventoryCardGrid from '@/components/inventory/InventoryCardGrid'
import InventoryFilters from '@/components/inventory/InventoryFilters'
import InventoryHeader from '@/components/inventory/InventoryHeader'
import InventoryItemFormModal from '@/components/inventory/InventoryItemFormModal'
import InventoryMetrics from '@/components/inventory/InventoryMetrics'
import InventorySidePanel from '@/components/inventory/InventorySidePanel'
import {
  formatCurrency,
  ImportToolMode,
  InventoryCard,
  ProfitFilter,
  SortDirection,
  SortKey,
} from '@/components/inventory/inventoryUtils'
import { useAuthStore } from '@/stores/authStore'
import { useInventoryStore } from '@/stores/inventoryStore'

export default function InventoryPage() {
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const {
    items,
    agingAlerts,
    summary,
    isLoading,
    error,
    getItem,
    addItem,
    deleteItem,
    isMutating,
    refreshInventoryPage,
  } = useInventoryStore()
  const [query, setQuery] = useState('')
  const [sportFilter, setSportFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [ageFilter, setAgeFilter] = useState('all')
  const [sortKey] = useState<SortKey>('market_value')
  const [sortDirection] = useState<SortDirection>('desc')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [profitFilter, setProfitFilter] = useState<ProfitFilter>('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [activeCard, setActiveCard] = useState<InventoryCard | null>(null)
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [importToolMode, setImportToolMode] = useState<ImportToolMode | null>(null)

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return

    refreshInventoryPage()
  }, [isAuthenticated, isHydrated, refreshInventoryPage])

  const sports = useMemo(
    () => Array.from(new Set(items.map((card) => card.sport))).sort(),
    [items],
  )

  const grades = useMemo(
    () => Array.from(new Set(items.map((card) => card.grade_key))).sort(),
    [items],
  )

  const filteredCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return items.filter((card) => {
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
        (!min || card.market_value >= min) && (!max || card.market_value <= max)
      const matchesProfit =
        profitFilter === 'all' ||
        (profitFilter === 'profit' && card.unrealized_gain > 0) ||
        (profitFilter === 'loss' && card.unrealized_gain < 0)
      const matchesPlatform =
        platformFilter === 'all' || card.platforms_listed.includes(platformFilter)

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
    items,
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

  const agingIds = new Set(agingAlerts.map((card) => card.id))
  const agingCards = filteredCards.filter(
    (card) => agingIds.has(card.id) || card.days_held > 60,
  )
  const listedCards = filteredCards.filter((card) => card.status === 'listed').length
  const filteredValue = filteredCards.reduce((sum, card) => sum + card.market_value, 0)
  const filteredGain = filteredCards.reduce((sum, card) => sum + card.unrealized_gain, 0)

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

  const openCardDetail = async (card: InventoryCard) => {
    setActiveCard(card)
    setIsDetailLoading(true)
    setDetailError(null)

    try {
      const item = await getItem(card.id)
      setActiveCard(item)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not load card details.'
      setDetailError(message)
    } finally {
      setIsDetailLoading(false)
    }
  }

  const closeCardDetail = () => {
    setActiveCard(null)
    setDetailError(null)
    setIsDetailLoading(false)
  }

  const openAddForm = () => {
    setIsAddFormOpen(true)
  }

  const closeForm = () => {
    setIsAddFormOpen(false)
  }

  const submitInventoryForm = async (payload: Parameters<typeof addItem>[0]) => {
    await addItem(payload)
    closeForm()
  }

  const handleDeleteItem = async (card: InventoryCard) => {
    const confirmed = window.confirm(`Delete ${card.player_name} from inventory?`)
    if (!confirmed) return

    await deleteItem(card.id)
    closeCardDetail()
  }

  return (
    <Shell>
      <div className="space-y-6">
        <InventoryHeader
          onAddItem={openAddForm}
          onOpenImportTool={setImportToolMode}
        />

        <InventoryMetrics
          agingCount={agingCards.length}
          filteredCount={filteredCards.length}
          filteredGain={filteredGain}
          filteredValue={filteredValue}
          listedCount={listedCards}
          totalPortfolioValue={summary?.total_market_value ?? filteredValue}
        />

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

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

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            {isLoading ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
                Loading inventory...
              </div>
            ) : (
              <InventoryCardGrid
                cards={filteredCards}
                onCardDetail={openCardDetail}
              />
            )}
          </div>

          <InventorySidePanel
            agingCards={agingCards}
            onCardDetail={openCardDetail}
            onOpenImportTool={setImportToolMode}
          />
        </div>
      </div>

      {activeCard && (
        <CardDetailModal
          card={activeCard}
          error={detailError}
          isLoading={isDetailLoading}
          onClose={closeCardDetail}
          onDelete={handleDeleteItem}
        />
      )}

      {isAddFormOpen && (
        <InventoryItemFormModal
          card={null}
          isSaving={isMutating}
          mode="add"
          onClose={closeForm}
          onSubmit={submitInventoryForm}
        />
      )}

      {importToolMode && (
        <ImportToolsModal
          initialMode={importToolMode}
          onClose={() => setImportToolMode(null)}
        />
      )}
    </Shell>
  )
}
