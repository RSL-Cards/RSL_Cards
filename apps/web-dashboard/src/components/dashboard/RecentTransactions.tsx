'use client'

import Link from 'next/link'
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Smartphone } from 'lucide-react'

interface RecentTransactionsProps {
  transactions: Array<{
    id: string
    type: 'buy' | 'sell'
    player: string
    grade: string
    price: number
    profit: number | null
    margin: number | null
    channel: string
    payment: string
    time: string
  }>
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const getPaymentIcon = (payment: string) => {
    switch (payment.toLowerCase()) {
      case 'cash':
        return DollarSign
      case 'paypal':
      case 'ebay':
        return CreditCard
      case 'venmo':
      case 'cashapp':
      case 'zelle':
        return Smartphone
      default:
        return DollarSign
    }
  }

  const getGradeColor = (grade: string) => {
    if (grade.includes('PSA')) return 'chip-warning'
    if (grade.includes('BGS')) return 'chip-blue'
    return 'bg-gray-500/20 text-gray-400'
  }

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-xl">Recent Transactions</h3>
        <Link 
          href="/transactions"
          className="text-accent-blue hover:text-blue-400 text-sm font-medium transition-colors duration-200"
        >
          View All →
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider pb-3">
                Type
              </th>
              <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider pb-3">
                Card
              </th>
              <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider pb-3">
                Grade
              </th>
              <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider pb-3">
                Price
              </th>
              <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider pb-3">
                Profit
              </th>
              <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider pb-3">
                Margin
              </th>
              <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider pb-3">
                Channel
              </th>
              <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider pb-3">
                Payment
              </th>
              <th className="text-right text-xs font-medium text-text-secondary uppercase tracking-wider pb-3">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((transaction) => {
              const PaymentIcon = getPaymentIcon(transaction.payment)
              
              return (
                <tr key={transaction.id} className="hover:bg-white/2 transition-colors duration-200">
                  <td className="py-3">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'buy' 
                        ? 'bg-accent-blue/20 text-accent-blue' 
                        : 'bg-accent-red/20 text-accent-red'
                    }`}>
                      {transaction.type.toUpperCase()}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="text-white font-medium">{transaction.player}</div>
                  </td>
                  <td className="py-3">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(transaction.grade)}`}>
                      {transaction.grade}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <div className="text-white font-mono">${transaction.price}</div>
                  </td>
                  <td className="py-3 text-right">
                    {transaction.profit !== null ? (
                      <div className="flex items-center justify-end gap-1">
                        {transaction.profit > 0 ? (
                          <TrendingUp className="w-3 h-3 text-success" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-accent-red" />
                        )}
                        <span className={`font-mono text-sm ${
                          transaction.profit > 0 ? 'text-success' : 'text-accent-red'
                        }`}>
                          +${transaction.profit}
                        </span>
                      </div>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {transaction.margin !== null ? (
                      <div className={`font-mono text-sm ${
                        transaction.margin > 0 ? 'text-success' : 'text-accent-red'
                      }`}>
                        {transaction.margin}%
                      </div>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="text-text-secondary text-sm">{transaction.channel}</div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <PaymentIcon className="w-3 h-3 text-text-muted" />
                      <span className="text-text-secondary text-sm">{transaction.payment}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <div className="text-text-secondary text-sm">{transaction.time}</div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
