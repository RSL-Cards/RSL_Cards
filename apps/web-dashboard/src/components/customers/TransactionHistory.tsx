import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { CustomerTransaction } from './customersTypes'
import { transactionTypeStyles } from './customersUtils'

interface TransactionHistoryProps {
  transactions: CustomerTransaction[]
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
      <h3 className="mb-4 text-xl font-bold text-gray-900">Transaction History</h3>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Card</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-4 py-3 text-gray-500">{transaction.date}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900">{transaction.card}</div>
                  <div className="text-xs text-gray-400">{transaction.platform}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={transactionTypeStyles[transaction.type]}>
                    {transaction.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-gray-900">
                  {formatCurrency(transaction.amount)}
                </td>
                <td className={`px-4 py-3 font-mono ${transaction.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.profit >= 0 ? '+' : ''}{formatCurrency(transaction.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
