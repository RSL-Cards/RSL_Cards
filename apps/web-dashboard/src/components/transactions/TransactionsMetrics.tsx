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
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Current Balance</div>
        <div className="mt-2 font-mono text-3xl font-bold text-gray-900">
          {formatCurrency(currentBalance)}
        </div>
        <div className="mt-1 text-sm text-gray-500">Opening {formatCurrency(openingBalance)}</div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <ArrowDownLeft className="h-4 w-4 text-red-500" />
          Total Debit
        </div>
        <div className="mt-2 font-mono text-3xl font-bold text-red-600">
          {formatCurrency(totals.debit)}
        </div>
        <div className="mt-1 text-sm text-gray-500">Purchases and cash out</div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <ArrowUpRight className="h-4 w-4 text-green-500" />
          Total Credit
        </div>
        <div className="mt-2 font-mono text-3xl font-bold text-green-600">
          {formatCurrency(totals.credit)}
        </div>
        <div className="mt-1 text-sm text-gray-500">Sales and cash in</div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Realized Profit</div>
        <div className={`mt-2 font-mono text-3xl font-bold ${totals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {totals.profit >= 0 ? '+' : ''}{formatCurrency(totals.profit)}
        </div>
        <div className="mt-1 text-sm text-gray-500">{totals.count} entries visible</div>
      </div>
    </div>
  )
}
