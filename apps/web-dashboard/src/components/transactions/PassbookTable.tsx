import { ArrowDownLeft, ArrowUpRight, CalendarDays } from 'lucide-react'
import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { PassbookTransaction } from './transactionsTypes'
import {
  formatDate,
  formatChannelName,
  formatPaymentMethodName,
  getPaymentIcon,
} from './transactionsUtils'

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
    <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] shadow-sm overflow-hidden">
      <div className="p-6 border-b border-[#252525]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Transaction History</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Showing {transactions.length} of {totalCount} transactions.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-zinc-400">
            <CalendarDays className="h-4 w-4 text-zinc-500" />
            Updated through {formatDate(latestDate)}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1320px] text-left">
          <thead className="bg-[#141414] text-xs font-medium uppercase tracking-wider text-zinc-400 border-b border-[#252525]">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Ref</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Card / Description</th>
              <th className="px-6 py-4">Event / Party</th>
              <th className="px-6 py-4">Channel</th>
              <th className="px-6 py-4">Payment</th>
              <th className="px-6 py-4 text-right">Money Out</th>
              <th className="px-6 py-4 text-right">Money In</th>
              <th className="px-6 py-4 text-right">Realized Profit</th>
              <th className="px-6 py-4 text-right">Net Cash Flow</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252525] bg-[#0D0D0D]">
            {transactions.map((transaction) => {
              const PaymentIcon = getPaymentIcon(transaction.payment)
              const isCredit = transaction.credit > 0
              const isDebit = transaction.debit > 0

              return (
                <tr key={transaction.id} className="transition-colors hover:bg-[#141414]">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{formatDate(transaction.date)}</div>
                    <div className="text-xs text-zinc-400">{transaction.time}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                    {transaction.reference}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      isCredit
                        ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                        : isDebit
                          ? 'border border-red-500/30 bg-red-500/15 text-red-400'
                          : 'border border-amber-500/30 bg-amber-500/15 text-amber-400'
                    }`}>
                      {isCredit ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{transaction.card}</div>
                    <div className="text-xs text-zinc-400">{transaction.grade}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{transaction.customer}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{formatChannelName(transaction.channel)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <PaymentIcon className="h-4 w-4 text-zinc-500" />
                      {formatPaymentMethodName(transaction.payment)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm">
                    {transaction.debit ? (
                      <span className="text-red-400">-{formatCurrency(transaction.debit)}</span>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm">
                    {transaction.credit ? (
                      <span className="text-emerald-400">+{formatCurrency(transaction.credit)}</span>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {transaction.profit !== null ? (
                      <div>
                        <div className={`font-mono text-sm font-semibold ${transaction.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {transaction.profit >= 0 ? '+' : ''}{formatCurrency(transaction.profit)}
                        </div>
                        {transaction.margin !== null && (
                          <div className="text-xs text-zinc-500">{transaction.margin}% margin</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm font-bold text-white">
                    {formatCurrency(transaction.balance)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {transactions.length === 0 && (
        <div className="py-12 text-center text-sm text-zinc-400">
          No transactions match the selected filters.
        </div>
      )}
    </div>
  )
}
