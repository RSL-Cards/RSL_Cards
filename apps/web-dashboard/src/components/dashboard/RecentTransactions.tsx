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
    type: 'buy' | 'sell' | 'trade' | 'expense'
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
      return 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
    }

    if (grade.includes('BGS')) {
      return 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
    }

    return 'bg-[#141414] text-zinc-300 border border-[#252525]'
  }

  return (
    <div className="dashboard-card bg-[#0D0D0D] border border-[#252525] rounded-3xl p-7 shadow-sm">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">

        <div>

          <h3 className="text-white font-bold text-2xl tracking-tight">
            Recent Transactions
          </h3>

          <div className="text-zinc-400 text-sm mt-1">
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
            bg-[#E8001C]/15
            hover:bg-[#E8001C]/25
            text-[#E8001C]
            text-sm
            font-semibold
            border
            border-[#E8001C]/30
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
          <div className="py-12 text-center flex flex-col items-center justify-center space-y-2 bg-[#141414] rounded-2xl border border-[#252525]">
            <div className="rounded-full bg-[#1E1E1E] p-3">
              <CreditCard className="h-6 w-6 text-zinc-400" />
            </div>
            <p className="font-medium text-white">No recent transactions</p>
            <p className="text-sm text-zinc-400 px-4">When you buy or sell cards, they will appear here.</p>
          </div>
        ) : (
          transactions.map((transaction) => {
            const PaymentIcon = getPaymentIcon(transaction.payment)
            return (
              <div key={transaction.id} className="bg-[#141414] border border-[#252525] rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-white">{transaction.player}</div>
                    <div className="text-xs text-zinc-400 mt-1">{transaction.channel} • {transaction.time}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-mono font-bold text-white">${transaction.price}</div>
                    <div className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${transaction.type === 'buy' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' : transaction.type === 'trade' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
                      {transaction.type.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#252525]">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold tracking-wide ${getGradeColor(transaction.grade)}`}>
                    {transaction.grade}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 bg-[#1E1E1E] px-2 py-1 rounded-md">
                      <PaymentIcon className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{transaction.payment}</span>
                    </div>
                    {transaction.profit !== null && (
                      <div className={`flex items-center gap-1 text-sm font-semibold ${transaction.profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
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
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-[#252525]">

        <table className="w-full min-w-[900px]">

          {/* Head */}
          <thead className="bg-[#141414]">

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
                    text-zinc-400
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
          <tbody className="divide-y divide-[#252525] bg-[#0D0D0D]">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-zinc-400 text-sm">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="rounded-full bg-[#141414] p-3">
                      <CreditCard className="h-6 w-6 text-zinc-500" />
                    </div>
                    <p className="font-medium text-white">No recent transactions</p>
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
                    hover:bg-[#141414]/70
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
                            ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                            : transaction.type === 'trade'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/15 text-red-400 border-red-500/30'
                        }
                      `}
                    >
                      {transaction.type.toUpperCase()}
                    </div>
                  </td>

                  {/* Card */}
                  <td className="px-5 py-4">

                    <div className="text-white font-semibold whitespace-nowrap">
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

                    <div className="text-white font-mono font-semibold whitespace-nowrap">
                      {transaction.type === 'trade'
                        ? transaction.price > 0
                          ? `+$${transaction.price}`
                          : transaction.price < 0
                          ? `-$${Math.abs(transaction.price)}`
                          : 'Straight Trade'
                        : `$${transaction.price}`}
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
                              ? 'text-emerald-400'
                              : 'text-red-400'
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

                      <span className="text-zinc-500">
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
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }
                        `}
                      >
                        {transaction.margin}%
                      </div>

                    ) : (

                      <span className="text-zinc-500">
                        —
                      </span>
                    )}
                  </td>

                  {/* Channel */}
                  <td className="px-5 py-4">

                    <div className="text-zinc-400 text-sm whitespace-nowrap">
                      {transaction.channel}
                    </div>
                  </td>

                  {/* Payment */}
                  <td className="px-5 py-4">

                    <div className="flex items-center gap-2 whitespace-nowrap">

                      <div className="w-7 h-7 rounded-lg bg-[#1E1E1E] flex items-center justify-center">

                        <PaymentIcon className="w-4 h-4 text-zinc-400" />
                      </div>

                      <span className="text-zinc-300 text-sm">
                        {transaction.payment}
                      </span>
                    </div>
                  </td>

                  {/* Time */}
                  <td className="px-5 py-4 text-right">

                    <div className="text-zinc-400 text-sm whitespace-nowrap">
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
      <div className="flex items-center justify-between mt-5 pt-5 border-t border-[#252525]">

        <div className="text-zinc-400 text-sm">
          Showing latest {transactions.length} transactions
        </div>

        <button className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors duration-200">
          Export Transactions →
        </button>
      </div>
    </div>
  )
}