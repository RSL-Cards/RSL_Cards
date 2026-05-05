'use client'

import { useMemo, useState } from 'react'
import Shell from '@/components/layout/Shell'
import PassbookTable from '@/components/transactions/PassbookTable'
import TransactionsFilters from '@/components/transactions/TransactionsFilters'
import TransactionsHeader from '@/components/transactions/TransactionsHeader'
import TransactionsMetrics from '@/components/transactions/TransactionsMetrics'
import { PeriodFilter } from '@/components/transactions/transactionsTypes'
import {
  downloadFile,
  formatDate,
  latestDate,
  openingBalance,
  passbookTransactions,
} from '@/components/transactions/transactionsUtils'
import { formatCurrency } from '@/components/inventory/inventoryUtils'

export default function TransactionsPage() {
  const [period, setPeriod] = useState<PeriodFilter>('all')
  const [fromDate, setFromDate] = useState('2026-03-01')
  const [toDate, setToDate] = useState(latestDate)
  const [typeFilter, setTypeFilter] = useState('all')
  const [channelFilter, setChannelFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [query, setQuery] = useState('')

  const channelOptions = useMemo(
    () => Array.from(new Set(passbookTransactions.map((transaction) => transaction.channel))),
    []
  )

  const paymentOptions = useMemo(
    () => Array.from(new Set(passbookTransactions.map((transaction) => transaction.payment))),
    []
  )

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const latest = new Date(`${latestDate}T12:00:00`)
    const sevenDaysAgo = new Date(latest)
    sevenDaysAgo.setDate(latest.getDate() - 6)
    const thirtyDaysAgo = new Date(latest)
    thirtyDaysAgo.setDate(latest.getDate() - 29)

    return passbookTransactions.filter((transaction) => {
      const transactionDate = new Date(`${transaction.date}T12:00:00`)
      const matchesPeriod =
        period === 'all' ||
        (period === 'latest' && transaction.date === latestDate) ||
        (period === '7d' && transactionDate >= sevenDaysAgo && transactionDate <= latest) ||
        (period === '30d' && transactionDate >= thirtyDaysAgo && transactionDate <= latest) ||
        (period === 'custom' && transaction.date >= fromDate && transaction.date <= toDate)
      const matchesType = typeFilter === 'all' || transaction.type === typeFilter
      const matchesChannel = channelFilter === 'all' || transaction.channel === channelFilter
      const matchesPayment = paymentFilter === 'all' || transaction.payment === paymentFilter
      const searchable = [
        transaction.id,
        transaction.card,
        transaction.customer,
        transaction.grade,
        transaction.channel,
        transaction.payment,
        transaction.reference,
        transaction.type,
        formatCurrency(transaction.debit),
        formatCurrency(transaction.credit),
        formatCurrency(transaction.balance),
      ]
        .join(' ')
        .toLowerCase()

      return (
        matchesPeriod &&
        matchesType &&
        matchesChannel &&
        matchesPayment &&
        (!normalizedQuery || searchable.includes(normalizedQuery))
      )
    })
  }, [channelFilter, fromDate, paymentFilter, period, query, toDate, typeFilter])

  const totals = useMemo(
    () =>
      filteredTransactions.reduce(
        (summary, transaction) => ({
          debit: summary.debit + transaction.debit,
          credit: summary.credit + transaction.credit,
          profit: summary.profit + (transaction.profit ?? 0),
          count: summary.count + 1,
        }),
        { debit: 0, credit: 0, profit: 0, count: 0 }
      ),
    [filteredTransactions]
  )

  const currentBalance = filteredTransactions[0]?.balance ?? openingBalance

  const exportRows = filteredTransactions.map((transaction) => ({
    Date: formatDate(transaction.date),
    Time: transaction.time,
    Reference: transaction.reference,
    Type: transaction.type.toUpperCase(),
    Card: transaction.card,
    Customer: transaction.customer,
    Grade: transaction.grade,
    Channel: transaction.channel,
    Payment: transaction.payment,
    Debit: transaction.debit ? formatCurrency(transaction.debit) : '',
    Credit: transaction.credit ? formatCurrency(transaction.credit) : '',
    Profit: transaction.profit !== null ? formatCurrency(transaction.profit) : '',
    Margin: transaction.margin !== null ? `${transaction.margin}%` : '',
    Balance: formatCurrency(transaction.balance),
  }))

  const exportCsv = () => {
    const headers = Object.keys(exportRows[0] ?? {
      Date: '',
      Time: '',
      Reference: '',
      Type: '',
      Card: '',
      Customer: '',
      Grade: '',
      Channel: '',
      Payment: '',
      Debit: '',
      Credit: '',
      Profit: '',
      Margin: '',
      Balance: '',
    })
    const csv = [
      headers.join(','),
      ...exportRows.map((row) =>
        headers
          .map((header) => `"${String(row[header as keyof typeof row] ?? '').replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n')

    downloadFile(
      `rsl-transactions-${period}-${new Date().toISOString().slice(0, 10)}.csv`,
      new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    )
  }

  const exportPdf = async () => {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ])
    const doc = new jsPDF({ orientation: 'landscape' })

    doc.setFontSize(16)
    doc.text('RSL Cards Transaction Passbook', 14, 16)
    doc.setFontSize(9)
    doc.text(
      `Generated ${formatDate(new Date().toISOString().slice(0, 10))} | ${totals.count} transactions | Balance ${formatCurrency(currentBalance)}`,
      14,
      23
    )

    autoTable(doc, {
      startY: 30,
      head: [[
        'Date',
        'Ref',
        'Type',
        'Card',
        'Customer',
        'Channel',
        'Payment',
        'Debit',
        'Credit',
        'Profit',
        'Balance',
      ]],
      body: filteredTransactions.map((transaction) => [
        formatDate(transaction.date),
        transaction.reference,
        transaction.type.toUpperCase(),
        transaction.card,
        transaction.customer,
        transaction.channel,
        transaction.payment,
        transaction.debit ? formatCurrency(transaction.debit) : '-',
        transaction.credit ? formatCurrency(transaction.credit) : '-',
        transaction.profit !== null ? formatCurrency(transaction.profit) : '-',
        formatCurrency(transaction.balance),
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [0, 87, 255] },
      columnStyles: {
        3: { cellWidth: 54 },
        4: { cellWidth: 32 },
      },
    })

    doc.save(`rsl-transactions-${period}-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <Shell>
      <div className="space-y-6">
        <TransactionsHeader onExportCsv={exportCsv} onExportPdf={exportPdf} />

        <TransactionsMetrics
          currentBalance={currentBalance}
          openingBalance={openingBalance}
          totals={totals}
        />

        <TransactionsFilters
          channelFilter={channelFilter}
          channelOptions={channelOptions}
          fromDate={fromDate}
          paymentFilter={paymentFilter}
          paymentOptions={paymentOptions}
          period={period}
          query={query}
          toDate={toDate}
          typeFilter={typeFilter}
          onChannelFilterChange={setChannelFilter}
          onFromDateChange={setFromDate}
          onPaymentFilterChange={setPaymentFilter}
          onPeriodChange={setPeriod}
          onQueryChange={setQuery}
          onToDateChange={setToDate}
          onTypeFilterChange={setTypeFilter}
        />

        <PassbookTable
          latestDate={latestDate}
          totalCount={passbookTransactions.length}
          transactions={filteredTransactions}
        />
      </div>
    </Shell>
  )
}
