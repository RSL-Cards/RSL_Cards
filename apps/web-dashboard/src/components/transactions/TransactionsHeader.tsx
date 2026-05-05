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
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent-blue/30 bg-accent-blue/10 px-3 py-1 text-xs font-semibold text-accent-blue">
          <Landmark className="h-3.5 w-3.5" />
          Transaction Passbook
        </div>
        <h1 className="text-3xl font-bold text-white">Transactions</h1>
        <p className="mt-1 max-w-2xl text-sm text-text-secondary">
          Track every buy and sell entry with debit, credit, profit, payment mode, and running balance.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onExportCsv}
          className="btn-outline inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
        >
          <Download className="h-4 w-4" />
          CSV
        </button>
        <button
          type="button"
          onClick={onExportPdf}
          className="btn-primary inline-flex items-center gap-2 text-sm"
        >
          <FileDown className="h-4 w-4" />
          PDF
        </button>
      </div>
    </div>
  )
}
