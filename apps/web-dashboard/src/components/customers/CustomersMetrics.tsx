import { formatCurrency } from '@/components/inventory/inventoryUtils'

interface CustomersMetricsProps {
  favoriteCount: number
  filteredCount: number
  totalContacts: number
  totalRevenue: number
  totalTransactions: number
}

export default function CustomersMetrics({
  favoriteCount,
  filteredCount,
  totalContacts,
  totalRevenue,
  totalTransactions,
}: CustomersMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Contacts</div>
        <div className="mt-2 font-mono text-3xl font-bold text-gray-900">{totalContacts}</div>
        <div className="mt-1 text-sm text-gray-400">{filteredCount} visible</div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Favorites</div>
        <div className="mt-2 font-mono text-3xl font-bold text-yellow-600">{favoriteCount}</div>
        <div className="mt-1 text-sm text-gray-400">Starred high-priority contacts</div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Customer Sales</div>
        <div className="mt-2 font-mono text-3xl font-bold text-green-600">
          {formatCurrency(totalRevenue)}
        </div>
        <div className="mt-1 text-sm text-gray-400">{totalTransactions} logged activities</div>
      </div>
    </div>
  )
}
