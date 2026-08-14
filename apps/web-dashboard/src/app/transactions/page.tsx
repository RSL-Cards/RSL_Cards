'use client'

import { useMemo, useState } from 'react'
import Shell from '@/components/layout/Shell'
import RSLLoader from '@/components/RSLLoader'
import PassbookTable from '@/components/transactions/PassbookTable'
import TransactionsFilters from '@/components/transactions/TransactionsFilters'
import TransactionsHeader from '@/components/transactions/TransactionsHeader'
import TransactionsMetrics from '@/components/transactions/TransactionsMetrics'
import { PeriodFilter } from '@/components/transactions/transactionsTypes'
import {
  downloadFile,
  formatDate,
} from '@/components/transactions/transactionsUtils'
import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { useDashboardPassbook } from '@/hooks/dashboard/useDashboard'
import { useAuthStore } from '@/stores/authStore'

import * as XLSX from 'xlsx'
import ExportColumnModal, { ExportColumnOption, ExportFormat } from '@/components/export/ExportColumnModal'

const TRANSACTION_EXPORT_COLUMNS: ExportColumnOption[] = [
  { key: 'Date', label: 'Date', defaultSelected: true },
  { key: 'Time', label: 'Time', defaultSelected: true },
  { key: 'Reference', label: 'Ref ID', defaultSelected: true },
  { key: 'Type', label: 'Type', defaultSelected: true },
  { key: 'Card', label: 'Card Description', defaultSelected: true },
  { key: 'Customer', label: 'Customer / Party', defaultSelected: true },
  { key: 'Grade', label: 'Grade', defaultSelected: true },
  { key: 'Channel', label: 'Channel', defaultSelected: true },
  { key: 'Payment', label: 'Payment Method', defaultSelected: true },
  { key: 'Debit', label: 'Money Out (Debit)', defaultSelected: true },
  { key: 'Credit', label: 'Money In (Credit)', defaultSelected: true },
  { key: 'Profit', label: 'Profit ($)', defaultSelected: true },
  { key: 'Margin', label: 'Margin (%)', defaultSelected: true },
  { key: 'Balance', label: 'Balance ($)', defaultSelected: true },
]

export default function TransactionsPage() {
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const { data: passbookTransactions = [], isLoading } = useDashboardPassbook()

  const [period, setPeriod] = useState<PeriodFilter>('all')
  const latestDate = passbookTransactions[0]?.date || new Date().toISOString().slice(0, 10)
  const [fromDate, setFromDate] = useState('2024-01-01')
  const [toDate, setToDate] = useState(latestDate)
  const [typeFilter, setTypeFilter] = useState('all')
  const [channelFilter, setChannelFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [query, setQuery] = useState('')

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [exportInitialFormat, setExportInitialFormat] = useState<ExportFormat>('csv')

  const channelOptions = useMemo(
    () => Array.from(new Set(passbookTransactions.map((transaction: any) => transaction.channel))),
    [passbookTransactions]
  )

  const paymentOptions = useMemo(
    () => Array.from(new Set(passbookTransactions.map((transaction: any) => transaction.payment))),
    [passbookTransactions]
  )

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const latest = new Date(`${latestDate}T12:00:00`)
    const sevenDaysAgo = new Date(latest)
    sevenDaysAgo.setDate(latest.getDate() - 6)
    const thirtyDaysAgo = new Date(latest)
    thirtyDaysAgo.setDate(latest.getDate() - 29)

    return passbookTransactions.filter((transaction: any) => {
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
  }, [channelFilter, fromDate, paymentFilter, period, query, toDate, typeFilter, passbookTransactions, latestDate])

  const totals = useMemo(
    () =>
      filteredTransactions.reduce(
        (summary: any, transaction: any) => ({
          debit: summary.debit + (transaction.debit || 0),
          credit: summary.credit + (transaction.credit || 0),
          profit: summary.profit + (transaction.profit || 0),
          count: summary.count + 1,
        }),
        { debit: 0, credit: 0, profit: 0, count: 0 }
      ),
    [filteredTransactions]
  )

  const currentBalance = filteredTransactions[0]?.balance ?? 0
  const openingBalance = passbookTransactions[passbookTransactions.length - 1]?.balance ?? 0

  const openExportModal = (format: ExportFormat) => {
    setExportInitialFormat(format)
    setIsExportModalOpen(true)
  }

  const handlePerformExport = async ({ format, selectedColumns }: { format: ExportFormat; selectedColumns: string[] }) => {
    const rawRows = filteredTransactions.map((transaction: any) => ({
      Date: formatDate(transaction.date),
      Time: transaction.time || '—',
      Reference: transaction.reference || '—',
      Type: transaction.type ? String(transaction.type).toUpperCase() : '—',
      Card: transaction.card || '—',
      Customer: transaction.customer || '—',
      Grade: transaction.grade || 'RAW',
      Channel: transaction.channel || '—',
      Payment: transaction.payment || '—',
      Debit: transaction.debit ? formatCurrency(transaction.debit) : '—',
      Credit: transaction.credit ? formatCurrency(transaction.credit) : '—',
      Profit: transaction.profit !== null ? formatCurrency(transaction.profit) : '—',
      Margin: transaction.margin !== null ? `${transaction.margin}%` : '—',
      Balance: formatCurrency(transaction.balance),
    }))

    if (format === 'csv' || format === 'xlsx') {
      const filteredRows = rawRows.map((row: any) => {
        const item: Record<string, any> = {}
        selectedColumns.forEach((colKey) => {
          item[colKey] = row[colKey] ?? '—'
        })
        return item
      })

      const worksheet = XLSX.utils.json_to_sheet(filteredRows)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Passbook Transactions')

      const fileName = `rsl-transactions-${period}-${new Date().toISOString().slice(0, 10)}.${format === 'csv' ? 'csv' : 'xlsx'}`
      XLSX.writeFile(workbook, fileName, { bookType: format === 'csv' ? 'csv' : 'xlsx' })
    } else if (format === 'pdf') {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ])
      const doc = new jsPDF({ orientation: 'landscape' })

      doc.setFontSize(18)
      doc.setTextColor(15, 23, 42)
      doc.text('RSL CARDS - Transaction Passbook', 14, 20)

      doc.setFontSize(9)
      doc.setTextColor(100, 116, 139)
      doc.text(
        `Generated on ${formatDate(new Date().toISOString().slice(0, 10))} | ${totals.count} transactions | Current Balance: ${formatCurrency(currentBalance)}`,
        14,
        28
      )

      const tableColumn = selectedColumns
      const tableRows = rawRows.map((row: any) =>
        selectedColumns.map((colKey) => row[colKey] ?? '—')
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

      doc.save(`rsl-transactions-${period}-${new Date().toISOString().slice(0, 10)}.pdf`)
    }
  }

  if (!isHydrated || isLoading) {
    return (
      <Shell>
        <div className="flex h-64 items-center justify-center">
          <RSLLoader size={48} />
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="space-y-6">
        <TransactionsHeader
          onExportCsv={() => openExportModal('csv')}
          onExportPdf={() => openExportModal('pdf')}
        />

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

      <ExportColumnModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Transactions Passbook"
        subtitle="Select format and columns to include in your transaction export"
        availableColumns={TRANSACTION_EXPORT_COLUMNS}
        onExport={handlePerformExport}
        initialFormat={exportInitialFormat}
      />
    </Shell>
  )
}
