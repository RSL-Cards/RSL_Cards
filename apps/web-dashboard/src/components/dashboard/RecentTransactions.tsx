'use client'

import Link from 'next/link'
import { formatDisplayDate } from '@/lib/utils'

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Smartphone
} from 'lucide-react'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import ExportColumnModal, { ExportColumnOption, ExportFormat } from '@/components/export/ExportColumnModal'

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

const DASHBOARD_EXPORT_COLUMNS: ExportColumnOption[] = [
  { key: 'player', label: 'Player Name', defaultSelected: true },
  { key: 'type', label: 'Type (Buy/Sell)', defaultSelected: true },
  { key: 'grade', label: 'Grade', defaultSelected: true },
  { key: 'price', label: 'Price ($)', defaultSelected: true },
  { key: 'profit', label: 'Profit ($)', defaultSelected: true },
  { key: 'margin', label: 'Margin (%)', defaultSelected: true },
  { key: 'channel', label: 'Channel', defaultSelected: true },
  { key: 'payment', label: 'Payment Method', defaultSelected: true },
  { key: 'time', label: 'Date & Time', defaultSelected: true },
]

export default function RecentTransactions({
  transactions
}: RecentTransactionsProps) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

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

  const columnHeaderMap: Record<string, string> = {
    player: 'Player Name',
    type: 'Type',
    grade: 'Grade',
    price: 'Price ($)',
    profit: 'Profit ($)',
    margin: 'Margin (%)',
    channel: 'Channel',
    payment: 'Payment Method',
    time: 'Date & Time',
  }

  const getFormattedValue = (tx: any, key: string) => {
    switch (key) {
      case 'player': return tx.player || 'Unknown'
      case 'type': return String(tx.type || '').toUpperCase()
      case 'grade': return tx.grade || 'RAW'
      case 'price': return typeof tx.price === 'number' ? `$${tx.price}` : String(tx.price || '')
      case 'profit': return tx.profit != null ? `${tx.profit > 0 ? '+' : ''}$${tx.profit}` : '—'
      case 'margin': return tx.margin != null ? `${tx.margin}%` : '—'
      case 'channel': return tx.channel || '—'
      case 'payment': return tx.payment || '—'
      case 'time': return formatDisplayDate(tx.time)
      default: return String(tx[key] ?? '—')
    }
  }

  const handlePerformExport = async ({ format, selectedColumns }: { format: ExportFormat; selectedColumns: string[] }) => {
    if (format === 'xlsx' || format === 'csv') {
      const worksheetData = transactions.map((tx) => {
        const row: Record<string, any> = {}
        selectedColumns.forEach((colKey) => {
          const header = columnHeaderMap[colKey] || colKey
          row[header] = getFormattedValue(tx, colKey)
        })
        return row
      })

      const worksheet = XLSX.utils.json_to_sheet(worksheetData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Recent Transactions')

      const fileName = `rsl-recent-transactions-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`
      XLSX.writeFile(workbook, fileName, { bookType: format === 'csv' ? 'csv' : 'xlsx' })
    } else if (format === 'pdf') {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ])
      const doc = new jsPDF({ orientation: 'landscape' })

      doc.setFontSize(18)
      doc.setTextColor(15, 23, 42)
      doc.text('RSL Cards - Recent Transactions Report', 14, 20)

      doc.setFontSize(9)
      doc.setTextColor(100, 116, 139)
      doc.text(`Generated on: ${formatDisplayDate(new Date())} | Total Records: ${transactions.length}`, 14, 28)

      const tableColumn = selectedColumns.map((colKey) => columnHeaderMap[colKey] || colKey)
      const tableRows = transactions.map((tx) =>
        selectedColumns.map((colKey) => getFormattedValue(tx, colKey))
      )

      autoTable(doc, {
        startY: 34,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [232, 0, 28], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      })

      doc.save(`rsl-recent-transactions-${new Date().toISOString().split('T')[0]}.pdf`)
    }
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
                    <div className="text-xs text-zinc-400 mt-1">{transaction.channel} • {formatDisplayDate(transaction.time)}</div>
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
                      {formatDisplayDate(transaction.time)}
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

        <button
          type="button"
          onClick={() => setIsExportModalOpen(true)}
          className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors duration-200"
        >
          Export Transactions →
        </button>
      </div>

      <ExportColumnModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Recent Transactions"
        subtitle="Select format and columns to include in your recent transactions export"
        availableColumns={DASHBOARD_EXPORT_COLUMNS}
        onExport={handlePerformExport}
        initialFormat="xlsx"
      />
    </div>
  )
}