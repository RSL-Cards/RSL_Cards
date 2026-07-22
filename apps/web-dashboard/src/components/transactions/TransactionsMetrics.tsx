import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { TransactionTotals } from './transactionsTypes'

interface TransactionsMetricsProps {
  currentBalance: number
  openingBalance: number
  totals: TransactionTotals
}

export default function TransactionsMetrics({
  currentBalance,
  openingBalance,
  totals,
}: TransactionsMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-400">Net Cash Flow</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">
          {formatCurrency(currentBalance)}
        </div>
        <div className="mt-1 text-sm text-zinc-500">Starting {formatCurrency(openingBalance)}</div>
      </div>
      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
          <ArrowDownLeft className="h-4 w-4 text-red-400" />
          Money Out (Purchases & Expenses)
        </div>
        <div className="mt-2 font-mono text-3xl font-bold text-red-400">
          {formatCurrency(totals.debit)}
        </div>
        <div className="mt-1 text-sm text-zinc-500">Purchases and operating expenses</div>
      </div>
      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
          <ArrowUpRight className="h-4 w-4 text-emerald-400" />
          Money In (Sales Revenue)
        </div>
        <div className="mt-2 font-mono text-3xl font-bold text-emerald-400">
          {formatCurrency(totals.credit)}
        </div>
        <div className="mt-1 text-sm text-zinc-500">Card sales and revenue collected</div>
      </div>
      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-400">Realized Profit</div>
        <div className={`mt-2 font-mono text-3xl font-bold ${totals.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {totals.profit >= 0 ? '+' : ''}{formatCurrency(totals.profit)}
        </div>
        <div className="mt-1 text-xs text-zinc-500">Sales revenue minus card cost basis &amp; fees ({totals.count} entries)</div>
      </div>
    </div>
  )
}
