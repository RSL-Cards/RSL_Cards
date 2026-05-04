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
      <div className="metric-card">
        <div className="text-sm font-medium text-text-secondary">Contacts</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{totalContacts}</div>
        <div className="mt-1 text-sm text-text-muted">{filteredCount} visible</div>
      </div>
      <div className="metric-card">
        <div className="text-sm font-medium text-text-secondary">Favorites</div>
        <div className="mt-2 font-mono text-3xl font-bold text-warning">{favoriteCount}</div>
        <div className="mt-1 text-sm text-text-muted">Starred high-priority contacts</div>
      </div>
      <div className="metric-card">
        <div className="text-sm font-medium text-text-secondary">Customer Sales</div>
        <div className="mt-2 font-mono text-3xl font-bold text-success">
          {formatCurrency(totalRevenue)}
        </div>
        <div className="mt-1 text-sm text-text-muted">{totalTransactions} logged activities</div>
      </div>
    </div>
  )
}
