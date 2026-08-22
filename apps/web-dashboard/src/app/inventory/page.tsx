'use client'

import { useEffect, useState, useCallback } from 'react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Shell from '@/components/layout/Shell'
import RSLLoader from '@/components/RSLLoader'
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
import { dashboardService } from '@/services/dashboardService'

import ExportColumnModal, { ExportColumnOption, ExportFormat } from '@/components/export/ExportColumnModal'

const INVENTORY_EXPORT_COLUMNS: ExportColumnOption[] = [
  { key: 'player', label: 'Player Name', defaultSelected: true },
  { key: 'year', label: 'Year', defaultSelected: true },
  { key: 'set', label: 'Set / Card Name', defaultSelected: true },
  { key: 'grade', label: 'Grade', defaultSelected: true },
  { key: 'sport', label: 'Sport', defaultSelected: true },
  { key: 'costBasis', label: 'Cost Basis ($)', defaultSelected: true },
  { key: 'marketValue', label: 'Market Value ($)', defaultSelected: true },
  { key: 'unrealizedGain', label: 'Unrealized Gain ($)', defaultSelected: true },
  { key: 'gainPct', label: 'Gain (%)', defaultSelected: true },
  { key: 'status', label: 'Status', defaultSelected: true },
  { key: 'addedAt', label: 'Date Added', defaultSelected: true },
]

export default function InventoryPage() {
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  const [page, setPage] = useState(1)
  const [selectedTab, setSelectedTab] = useState<'active' | 'sold'>('active')
  const limit = 20
  
  const statusParam = selectedTab === 'sold' ? 'sold' : undefined
  const { data: listData, isLoading: isListLoading } = useDashboardInventory(page, limit, undefined, statusParam)
  const { data: countsData, isLoading: isCountsLoading } = useDashboardInventoryCounts()
  
  const items = listData?.items || []
  const total = listData?.total || 0
  const totalPages = listData?.totalPages || 1

  const handleTabChange = useCallback((tab: 'active' | 'sold') => {
    setSelectedTab(tab)
    setPage(1)
  }, [])
  
  const isLoading = isListLoading || isCountsLoading
  const [activeCard, setActiveCard] = useState<InventoryCard | null>(null)
  
  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [exportInitialFormat, setExportInitialFormat] = useState<ExportFormat>('xlsx')

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return
  }, [isAuthenticated, isHydrated])

  const openCardDetail = (card: InventoryCard) => {
    setActiveCard(card)
  }

  const closeCardDetail = () => {
    setActiveCard(null)
  }

  const openExportModal = (format: ExportFormat) => {
    setExportInitialFormat(format)
    setIsExportModalOpen(true)
  }

  const handlePerformExport = async ({ format, selectedColumns }: { format: ExportFormat; selectedColumns: string[] }) => {
    let data = await dashboardService.exportInventory()
    if (!data || data.length === 0) {
      data = items.map((card: any) => ({
        player: card.playerName || card.player || 'Unknown',
        year: card.year || '',
        set: card.setName || card.set || '',
        grade: card.grade || card.gradeKey || 'RAW',
        sport: card.sport || 'Unknown',
        costBasis: Number(card.costBasis || 0),
        marketValue: Number(card.marketValue || 0),
        unrealizedGain: Number((card.marketValue || 0) - (card.costBasis || 0)),
        gainPct: card.costBasis ? (((card.marketValue || 0) - card.costBasis) / card.costBasis * 100).toFixed(1) + '%' : '0%',
        status: String(card.status || 'unlisted').toUpperCase(),
        addedAt: card.addedAt || ''
      }))
    }

    const columnHeaderMap: Record<string, string> = {
      player: 'Player Name',
      year: 'Year',
      set: 'Set / Card Name',
      grade: 'Grade',
      sport: 'Sport',
      costBasis: 'Cost Basis ($)',
      marketValue: 'Market Value ($)',
      unrealizedGain: 'Unrealized Gain ($)',
      gainPct: 'Gain (%)',
      status: 'Status',
      addedAt: 'Date Added',
    }

    const getFormattedValue = (card: any, key: string) => {
      switch (key) {
        case 'player': return card.player || 'Unknown'
        case 'year': return card.year || ''
        case 'set': return card.set || ''
        case 'grade': return card.grade || 'RAW'
        case 'sport': return card.sport || 'Unknown'
        case 'costBasis': return Number(card.costBasis || 0).toFixed(2)
        case 'marketValue': return Number(card.marketValue || 0).toFixed(2)
        case 'unrealizedGain': return Number(card.unrealizedGain || 0).toFixed(2)
        case 'gainPct': return card.gainPct || '0%'
        case 'status': return String(card.status || 'unlisted').toUpperCase()
        case 'addedAt': return card.addedAt || ''
        default: return String(card[key] ?? '')
      }
    }

    if (format === 'xlsx' || format === 'csv') {
      const worksheetData = data.map((card: any) => {
        const row: Record<string, any> = {}
        selectedColumns.forEach((colKey) => {
          const header = columnHeaderMap[colKey] || colKey
          row[header] = getFormattedValue(card, colKey)
        })
        return row
      })

      const worksheet = XLSX.utils.json_to_sheet(worksheetData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Portfolio Inventory')

      const fileName = `RSL_Inventory_Export_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`
      XLSX.writeFile(workbook, fileName, { bookType: format === 'csv' ? 'csv' : 'xlsx' })
    } else if (format === 'pdf') {
      const doc = new jsPDF()
      
      doc.setFontSize(18)
      doc.setTextColor(15, 23, 42)
      doc.text('RSL Cards - Portfolio Inventory Report', 14, 20)
      
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139)
      doc.text(`Generated on: ${new Date().toLocaleDateString()} | Total Items: ${data.length}`, 14, 28)

      const tableColumn = selectedColumns.map((colKey) => columnHeaderMap[colKey] || colKey)
      const tableRows = data.map((card: any) =>
        selectedColumns.map((colKey) => getFormattedValue(card, colKey))
      )

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 34,
        theme: 'grid',
        headStyles: { fillColor: [232, 0, 28], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      })

      doc.save(`RSL_Inventory_Export_${new Date().toISOString().split('T')[0]}.pdf`)
    }
  }

  if (!isHydrated || (isLoading && !listData)) {
    return (
      <Shell>
        <div className="flex h-64 items-center justify-center">
          <RSLLoader size={48} />
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="space-y-6">
        <InventoryHeader
          onAddItem={() => {}}
          onDownloadExcel={() => openExportModal('xlsx')}
          onDownloadPdf={() => openExportModal('pdf')}
        />

        <InventoryMetrics
          totalCards={countsData?.totalCards || 0}
          listedCards={countsData?.listedCards || 0}
          unlistedCards={countsData?.unlistedCards || 0}
          totalCostBasis={countsData?.totalCostBasis || 0}
          currentMarketValue={countsData?.currentMarketValue || 0}
          unrealizedGain={countsData?.unrealizedGain || 0}
        />

        {/* Active / History Tab Switcher */}
        <div className="flex items-center gap-1 rounded-2xl border border-[#252525] bg-[#0D0D0D] p-1 w-fit">
          <button
            onClick={() => handleTabChange('active')}
            className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              selectedTab === 'active'
                ? 'bg-[#E8001C] text-white shadow-lg shadow-red-900/30'
                : 'text-zinc-400 hover:text-white hover:bg-[#1A1A1A]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => handleTabChange('sold')}
            className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              selectedTab === 'sold'
                ? 'bg-[#E8001C] text-white shadow-lg shadow-red-900/30'
                : 'text-zinc-400 hover:text-white hover:bg-[#1A1A1A]'
            }`}
          >
            History
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <InventoryCardGrid
            cards={items}
            onCardDetail={openCardDetail}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border border-[#252525] bg-[#0D0D0D] px-4 py-3 sm:px-6 rounded-2xl shadow-sm">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-md border border-[#252525] bg-[#141414] px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-[#1A1A1A] disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-[#252525] bg-[#141414] px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-[#1A1A1A] disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-zinc-400">
                    Showing <span className="font-medium text-white">{(page - 1) * limit + 1}</span> to <span className="font-medium text-white">{Math.min(page * limit, total)}</span> of{' '}
                    <span className="font-medium text-white">{total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-zinc-400 border border-[#252525] bg-[#141414] hover:bg-[#1A1A1A] hover:text-white disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      &larr;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        aria-current={page === p ? 'page' : undefined}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold border ${
                          page === p 
                            ? 'z-10 bg-[#E8001C] border-[#E8001C] text-white'
                            : 'bg-[#141414] border-[#252525] text-zinc-300 hover:bg-[#1A1A1A] hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-zinc-400 border border-[#252525] bg-[#141414] hover:bg-[#1A1A1A] hover:text-white disabled:opacity-50"
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

      <ExportColumnModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Inventory Report"
        subtitle="Select file format and columns to include in your inventory report"
        availableColumns={INVENTORY_EXPORT_COLUMNS}
        onExport={handlePerformExport}
        initialFormat={exportInitialFormat}
      />
    </Shell>
  )
}
