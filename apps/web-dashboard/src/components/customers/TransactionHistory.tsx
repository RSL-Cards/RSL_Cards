import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { CustomerTransaction } from './customersTypes'
import { transactionTypeStyles } from './customersUtils'

interface TransactionHistoryProps {
  transactions: CustomerTransaction[]
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  return (
    <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm lg:col-span-2">
      <h3 className="mb-4 text-xl font-bold text-white">Transaction History</h3>
      <div className="overflow-hidden rounded-lg border border-[#252525]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#141414] text-xs uppercase text-zinc-400 border-b border-[#252525]">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Card</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252525]">
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-4 py-3 text-zinc-400">{transaction.date}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-white">{transaction.card}</div>
                  <div className="text-xs text-zinc-500">{transaction.platform}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={transactionTypeStyles[transaction.type]}>
                    {transaction.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-white">
                  {formatCurrency(transaction.amount)}
                </td>
                <td className={`px-4 py-3 font-mono ${transaction.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
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
