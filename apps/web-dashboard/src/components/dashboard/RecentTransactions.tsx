'use client'

import Link from 'next/link'

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Smartphone
} from 'lucide-react'

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

export default function RecentTransactions({
  transactions
}: RecentTransactionsProps) {

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

    if (grade.includes('PSA')) {
      return 'bg-amber-50 text-amber-700 border border-amber-100'
    }

    if (grade.includes('BGS')) {
      return 'bg-blue-50 text-blue-700 border border-blue-100'
    }

    return 'bg-gray-100 text-gray-600 border border-gray-200'
  }

  return (
    <div className="dashboard-card bg-white border border-gray-200 rounded-3xl p-7 shadow-sm hover:shadow-md transition-all duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">

        <div>

          <h3 className="text-gray-900 font-bold text-2xl tracking-tight">
            Recent Transactions
          </h3>

          <div className="text-gray-500 text-sm mt-1">
            Latest buying and selling activity
          </div>
        </div>

        <Link
          href="/transactions"
          className="
            inline-flex
            items-center
            justify-center
            px-4
            py-2
            rounded-xl
            bg-blue-50
            hover:bg-blue-100
            text-blue-700
            text-sm
            font-semibold
            border
            border-blue-100
            transition-all
            duration-200
          "
        >
          View All →
        </Link>
      </div>

      {/* Mobile Card View (Hidden on md and up) */}
      <div className="md:hidden space-y-4">
        {transactions.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center space-y-2 bg-gray-50/50 rounded-2xl border border-gray-100">
            <div className="rounded-full bg-gray-100 p-3">
              <CreditCard className="h-6 w-6 text-gray-400" />
            </div>
            <p className="font-medium text-gray-900">No recent transactions</p>
            <p className="text-sm text-gray-500 px-4">When you buy or sell cards, they will appear here.</p>
          </div>
        ) : (
          transactions.map((transaction) => {
            const PaymentIcon = getPaymentIcon(transaction.payment)
            return (
              <div key={transaction.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-900">{transaction.player}</div>
                    <div className="text-xs text-gray-500 mt-1">{transaction.channel} • {transaction.time}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-mono font-bold text-gray-900">${transaction.price}</div>
                    <div className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${transaction.type === 'buy' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                      {transaction.type.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold tracking-wide ${getGradeColor(transaction.grade)}`}>
                    {transaction.grade}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                      <PaymentIcon className="w-3.5 h-3.5 text-gray-500" />
                      <span>{transaction.payment}</span>
                    </div>
                    {transaction.profit !== null && (
                      <div className={`flex items-center gap-1 text-sm font-semibold ${transaction.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.profit > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {transaction.profit > 0 ? '+' : '-'}${Math.abs(transaction.profit)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-100">

        <table className="w-full min-w-[900px]">

          {/* Head */}
          <thead className="bg-gray-50">

            <tr>

              {[
                'Type',
                'Card',
                'Grade',
                'Price',
                'Profit',
                'Margin',
                'Channel',
                'Payment',
                'Time'
              ].map((heading) => (
                <th
                  key={heading}
                  className="
                    px-5
                    py-4
                    text-left
                    text-xs
                    font-semibold
                    text-gray-500
                    uppercase
                    tracking-wider
                    whitespace-nowrap
                  "
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-100 bg-white">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-gray-500 text-sm">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="rounded-full bg-gray-50 p-3">
                      <CreditCard className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="font-medium text-gray-900">No recent transactions</p>
                    <p>When you buy or sell cards, they will appear here.</p>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => {

              const PaymentIcon =
                getPaymentIcon(transaction.payment)

              return (
                <tr
                  key={transaction.id}
                  className="
                    hover:bg-gray-50/80
                    transition-all
                    duration-200
                  "
                >

                  {/* Type */}
                  <td className="px-5 py-4">

                    <div
                      className={`
                        inline-flex
                        items-center
                        px-3
                        py-1.5
                        rounded-full
                        text-xs
                        font-semibold
                        border
                        ${
                          transaction.type === 'buy'
                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                        }
                      `}
                    >
                      {transaction.type.toUpperCase()}
                    </div>
                  </td>

                  {/* Card */}
                  <td className="px-5 py-4">

                    <div className="text-gray-900 font-semibold whitespace-nowrap">
                      {transaction.player}
                    </div>
                  </td>

                  {/* Grade */}
                  <td className="px-5 py-4">

                    <div
                      className={`
                        inline-flex
                        items-center
                        px-3
                        py-1.5
                        rounded-full
                        text-xs
                        font-medium
                        whitespace-nowrap
                        ${getGradeColor(transaction.grade)}
                      `}
                    >
                      {transaction.grade}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-5 py-4 text-right">

                    <div className="text-gray-900 font-mono font-semibold whitespace-nowrap">
                      ${transaction.price}
                    </div>
                  </td>

                  {/* Profit */}
                  <td className="px-5 py-4 text-right">

                    {transaction.profit !== null ? (

                      <div
                        className={`
                          inline-flex
                          items-center
                          justify-end
                          gap-1
                          text-sm
                          font-semibold
                          whitespace-nowrap
                          ${
                            transaction.profit > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        `}
                      >

                        {transaction.profit > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}

                        {transaction.profit > 0 ? '+' : ''}
                        ${transaction.profit}
                      </div>

                    ) : (

                      <span className="text-gray-400">
                        —
                      </span>
                    )}
                  </td>

                  {/* Margin */}
                  <td className="px-5 py-4 text-right">

                    {transaction.margin !== null ? (

                      <div
                        className={`
                          text-sm
                          font-semibold
                          font-mono
                          whitespace-nowrap
                          ${
                            transaction.margin > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        `}
                      >
                        {transaction.margin}%
                      </div>

                    ) : (

                      <span className="text-gray-400">
                        —
                      </span>
                    )}
                  </td>

                  {/* Channel */}
                  <td className="px-5 py-4">

                    <div className="text-gray-600 text-sm whitespace-nowrap">
                      {transaction.channel}
                    </div>
                  </td>

                  {/* Payment */}
                  <td className="px-5 py-4">

                    <div className="flex items-center gap-2 whitespace-nowrap">

                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">

                        <PaymentIcon className="w-4 h-4 text-gray-500" />
                      </div>

                      <span className="text-gray-600 text-sm">
                        {transaction.payment}
                      </span>
                    </div>
                  </td>

                  {/* Time */}
                  <td className="px-5 py-4 text-right">

                    <div className="text-gray-500 text-sm whitespace-nowrap">
                      {transaction.time}
                    </div>
                  </td>
                </tr>
              )
            })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-100">

        <div className="text-gray-500 text-sm">
          Showing latest {transactions.length} transactions
        </div>

        <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors duration-200">
          Export Transactions →
        </button>
      </div>
    </div>
  )
}