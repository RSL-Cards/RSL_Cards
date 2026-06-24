'use client'

import { useEffect, useState } from 'react'
import Shell from '@/components/layout/Shell'
import CardDetailModal from '@/components/inventory/CardDetailModal'
import InventoryCardGrid from '@/components/inventory/InventoryCardGrid'
import InventoryHeader from '@/components/inventory/InventoryHeader'
import InventoryMetrics from '@/components/inventory/InventoryMetrics'
import {
  InventoryCard,
} from '@/components/inventory/inventoryUtils'
import { useAuthStore } from '@/stores/authStore'
import {
  useDashboardInventory,
  useDashboardInventoryCounts
} from '@/hooks/dashboard/useDashboard'

export default function InventoryPage() {
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  const [page, setPage] = useState(1)
  const limit = 20
  
  const { data: listData, isLoading: isListLoading } = useDashboardInventory(page, limit)
  const { data: countsData, isLoading: isCountsLoading } = useDashboardInventoryCounts()
  
  const items = listData?.items || []
  const total = listData?.total || 0
  const totalPages = listData?.totalPages || 1
  
  const isLoading = isListLoading || isCountsLoading
  const [activeCard, setActiveCard] = useState<InventoryCard | null>(null)

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return
  }, [isAuthenticated, isHydrated])

  const openCardDetail = (card: InventoryCard) => {
    setActiveCard(card)
  }

  const closeCardDetail = () => {
    setActiveCard(null)
  }

  if (!isHydrated || (isLoading && !listData)) {
    return (
      <Shell>
        <div className="flex h-64 items-center justify-center">
          <div className="text-sm text-gray-500">Loading inventory...</div>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="space-y-6">
        <InventoryHeader
          onAddItem={() => {}}
          onOpenImportTool={() => {}}
        />

        <InventoryMetrics
          totalCards={countsData?.totalCards || 0}
          listedCards={countsData?.listedCards || 0}
          unlistedCards={countsData?.unlistedCards || 0}
        />

        <div className="flex flex-col gap-6">
          <InventoryCardGrid
            cards={items}
            onCardDetail={openCardDetail}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-2xl shadow-sm">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                    <span className="font-medium">{total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      &larr;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        aria-current={page === p ? 'page' : undefined}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                          page === p 
                            ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      &rarr;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {activeCard && (
        <CardDetailModal
          card={activeCard}
          onClose={closeCardDetail}
        />
      )}
    </Shell>
  )
}
