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
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Passbook Ledger</h2>
            <p className="mt-1 text-sm text-gray-500">
              Showing {transactions.length} of {totalCount} transactions.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            Updated through {formatDate(latestDate)}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1320px] text-left">
          <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Ref</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Card / Details</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Channel</th>
              <th className="px-6 py-4">Payment</th>
              <th className="px-6 py-4 text-right">Debit</th>
              <th className="px-6 py-4 text-right">Credit</th>
              <th className="px-6 py-4 text-right">Profit</th>
              <th className="px-6 py-4 text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {transactions.map((transaction) => {
              const PaymentIcon = getPaymentIcon(transaction.payment)
              const isCredit = transaction.credit > 0
              const isDebit = transaction.debit > 0

              return (
                <tr key={transaction.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{formatDate(transaction.date)}</div>
                    <div className="text-xs text-gray-500">{transaction.time}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    {transaction.reference}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      isCredit
                        ? 'bg-green-100 text-green-700'
                        : isDebit
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {isCredit ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{transaction.card}</div>
                    <div className="text-xs text-gray-500">{transaction.grade}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{transaction.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{transaction.channel}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <PaymentIcon className="h-4 w-4 text-gray-400" />
                      {transaction.payment}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm">
                    {transaction.debit ? (
                      <span className="text-red-600">-{formatCurrency(transaction.debit)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm">
                    {transaction.credit ? (
                      <span className="text-green-600">+{formatCurrency(transaction.credit)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {transaction.profit !== null ? (
                      <div>
                        <div className={`font-mono text-sm font-semibold ${transaction.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.profit >= 0 ? '+' : ''}{formatCurrency(transaction.profit)}
                        </div>
                        {transaction.margin !== null && (
                          <div className="text-xs text-gray-500">{transaction.margin}% margin</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm font-bold text-gray-900">
                    {formatCurrency(transaction.balance)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {transactions.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-500">
          No transactions match the selected filters.
        </div>
      )}
    </div>
  )
}
