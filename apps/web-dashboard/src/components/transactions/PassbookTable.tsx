import { ArrowDownLeft, ArrowUpRight, CalendarDays } from 'lucide-react'
import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { PassbookTransaction } from './transactionsTypes'
import { formatDate, getPaymentIcon } from './transactionsUtils'

interface PassbookTableProps {
  latestDate: string
  totalCount: number
  transactions: PassbookTransaction[]
}

export default function PassbookTable({
  latestDate,
  totalCount,
  transactions,
}: PassbookTableProps) {
  return (
    <div className="dashboard-card">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Passbook Ledger</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Showing {transactions.length} of {totalCount} transactions.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-sm text-text-secondary">
          <CalendarDays className="h-4 w-4 text-text-muted" />
          Updated through {formatDate(latestDate)}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1320px]">
          <thead>
            <tr>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Date</th>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Ref</th>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Type</th>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Card / Details</th>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Customer</th>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Channel</th>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Payment</th>
              <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">Debit</th>
              <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">Credit</th>
              <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">Profit</th>
              <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((transaction) => {
              const PaymentIcon = getPaymentIcon(transaction.payment)
              const isCredit = transaction.credit > 0
              const isDebit = transaction.debit > 0

              return (
                <tr key={transaction.id} className="transition-colors duration-200 hover:bg-white/5">
                  <td className="py-4 pr-4">
                    <div className="font-medium text-white">{formatDate(transaction.date)}</div>
                    <div className="text-xs text-text-muted">{transaction.time}</div>
                  </td>
                  <td className="py-4 pr-4 font-mono text-xs text-text-secondary">
                    {transaction.reference}
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                      isCredit
                        ? 'bg-success/10 text-success'
                        : isDebit
                          ? 'bg-accent-red/10 text-accent-red'
                          : 'bg-warning/10 text-warning'
                    }`}>
                      {isCredit ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="font-semibold text-white">{transaction.card}</div>
                    <div className="text-xs text-text-muted">{transaction.grade}</div>
                  </td>
                  <td className="py-4 pr-4 text-sm text-text-secondary">{transaction.customer}</td>
                  <td className="py-4 pr-4 text-sm text-text-secondary">{transaction.channel}</td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <PaymentIcon className="h-4 w-4 text-text-muted" />
                      {transaction.payment}
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-right font-mono text-sm">
                    {transaction.debit ? (
                      <span className="text-accent-red">-{formatCurrency(transaction.debit)}</span>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                  <td className="py-4 pr-4 text-right font-mono text-sm">
                    {transaction.credit ? (
                      <span className="text-success">+{formatCurrency(transaction.credit)}</span>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                  <td className="py-4 pr-4 text-right">
                    {transaction.profit !== null ? (
                      <div>
                        <div className={`font-mono text-sm font-semibold ${transaction.profit >= 0 ? 'text-success' : 'text-accent-red'}`}>
                          {transaction.profit >= 0 ? '+' : ''}{formatCurrency(transaction.profit)}
                        </div>
                        {transaction.margin !== null && (
                          <div className="text-xs text-text-muted">{transaction.margin}% margin</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                  <td className="py-4 text-right font-mono text-sm font-semibold text-white">
                    {formatCurrency(transaction.balance)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {transactions.length === 0 && (
        <div className="py-12 text-center text-sm text-text-secondary">
          No transactions match the selected filters.
        </div>
      )}
    </div>
  )
}
