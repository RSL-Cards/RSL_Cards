import { CalendarDays, Download, FileDown } from 'lucide-react'

interface ReportsHeaderProps {
  onExportCsv: () => void
  onExportPdf: () => void
}

export default function ReportsHeader({ onExportCsv, onExportPdf }: ReportsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#E8001C]/30 bg-[#E8001C]/15 px-3 py-1 text-xs font-semibold text-[#E8001C]">
          <CalendarDays className="h-3.5 w-3.5" />
          Dealer Performance Reports
        </div>
        <h1 className="text-3xl font-bold text-white">Reports</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-400">
          Review sales, margin, aging inventory, and RSL period performance from one reporting view.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onExportCsv}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#252525] bg-[#141414] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1A1A1A]"
        >
          <Download className="h-4 w-4" />
          CSV
        </button>
        <button
          type="button"
          onClick={onExportPdf}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#E8001C] hover:bg-[#CC0018] px-4 text-sm font-semibold text-white shadow-sm transition-colors"
        >
          <FileDown className="h-4 w-4" />
          PDF
        </button>
      </div>
    </div>
  )
}
