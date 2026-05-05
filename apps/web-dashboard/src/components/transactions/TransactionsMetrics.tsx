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
      <div className="metric-card">
        <div className="text-sm font-medium text-text-secondary">Current Balance</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">
          {formatCurrency(currentBalance)}
        </div>
        <div className="mt-1 text-sm text-text-muted">Opening {formatCurrency(openingBalance)}</div>
      </div>
      <div className="metric-card">
        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <ArrowDownLeft className="h-4 w-4 text-accent-red" />
          Total Debit
        </div>
        <div className="mt-2 font-mono text-3xl font-bold text-accent-red">
          {formatCurrency(totals.debit)}
        </div>
        <div className="mt-1 text-sm text-text-muted">Purchases and cash out</div>
      </div>
      <div className="metric-card">
        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <ArrowUpRight className="h-4 w-4 text-success" />
          Total Credit
        </div>
        <div className="mt-2 font-mono text-3xl font-bold text-success">
          {formatCurrency(totals.credit)}
        </div>
        <div className="mt-1 text-sm text-text-muted">Sales and cash in</div>
      </div>
      <div className="metric-card">
        <div className="text-sm font-medium text-text-secondary">Realized Profit</div>
        <div className={`mt-2 font-mono text-3xl font-bold ${totals.profit >= 0 ? 'text-success' : 'text-accent-red'}`}>
          {totals.profit >= 0 ? '+' : ''}{formatCurrency(totals.profit)}
        </div>
        <div className="mt-1 text-sm text-text-muted">{totals.count} entries visible</div>
      </div>
    </div>
  )
}
