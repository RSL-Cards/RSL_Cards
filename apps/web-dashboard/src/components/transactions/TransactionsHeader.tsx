import { Download, FileDown, Landmark } from 'lucide-react'

interface TransactionsHeaderProps {
  onExportCsv: () => void
  onExportPdf: () => void
}

export default function TransactionsHeader({
  onExportCsv,
  onExportPdf,
}: TransactionsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#E8001C]/30 bg-[#E8001C]/15 px-3 py-1 text-xs font-semibold text-[#E8001C]">
          <Landmark className="h-3.5 w-3.5" />
          Transaction Passbook
        </div>
        <h1 className="text-3xl font-bold text-white">Transactions</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-400">
          Track every buy and sell entry with debit, credit, profit, payment mode, and running balance.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onExportCsv}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#252525] bg-[#141414] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1A1A1A]"
        >
          <Download className="h-4 w-4 text-zinc-400" />
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
