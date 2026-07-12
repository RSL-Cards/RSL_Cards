import { CalendarDays, Download, FileDown } from 'lucide-react'

interface ReportsHeaderProps {
  onExportCsv: () => void
  onExportPdf: () => void
}

export default function ReportsHeader({ onExportCsv, onExportPdf }: ReportsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
          <CalendarDays className="h-3.5 w-3.5" />
          Dealer Performance Reports
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Review sales, margin, aging inventory, and RSL period performance from one reporting view.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onExportCsv}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
        >
          <Download className="h-4 w-4" />
          CSV
        </button>
        <button
          type="button"
          onClick={onExportPdf}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-transparent bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center gap-2 text-sm"
        >
          <FileDown className="h-4 w-4" />
          PDF
        </button>
      </div>
    </div>
  )
}
