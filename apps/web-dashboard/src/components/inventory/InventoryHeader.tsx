import { FileSpreadsheet, FileText, Loader2, Plus } from 'lucide-react'
import Link from 'next/link'
import { ImportToolMode } from './inventoryUtils'

interface InventoryHeaderProps {
  onAddItem: () => void
  onOpenImportTool?: (mode: ImportToolMode) => void
  onDownloadExcel?: () => void
  onDownloadPdf?: () => void
  isExportingExcel?: boolean
  isExportingPdf?: boolean
}

export default function InventoryHeader({
  onAddItem,
  onOpenImportTool,
  onDownloadExcel,
  onDownloadPdf,
  isExportingExcel = false,
  isExportingPdf = false,
}: InventoryHeaderProps) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Inventory</h1>
        <p className="mt-1 max-w-2xl text-sm font-medium text-zinc-400">
          Search, price, list, import, and monitor every card in your portfolio.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onDownloadExcel && (
          <button
            type="button"
            onClick={onDownloadExcel}
            disabled={isExportingExcel}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600/90 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-50"
          >
            {isExportingExcel ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            {isExportingExcel ? 'Exporting...' : 'Excel (.xlsx)'}
          </button>
        )}
        {onDownloadPdf && (
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600/90 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:opacity-50"
          >
            {isExportingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {isExportingPdf ? 'Exporting...' : 'PDF (.pdf)'}
          </button>
        )}
        <Link
          href="/inventory/add"
          className="inline-flex items-center gap-2 rounded-xl bg-[#E8001C] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#CC0018]"
        >
          <Plus className="h-4 w-4" />
          Bulk Upload / Scan
        </Link>
      </div>
    </div>
  )
}
