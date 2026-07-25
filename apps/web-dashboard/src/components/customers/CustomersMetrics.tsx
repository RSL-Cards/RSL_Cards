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
      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-400">Contacts</div>
        <div className="mt-2 font-mono text-3xl font-bold text-white">{totalContacts}</div>
        <div className="mt-1 text-sm text-zinc-500">{filteredCount} visible</div>
      </div>
      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-400">Favorites</div>
        <div className="mt-2 font-mono text-3xl font-bold text-amber-400">{favoriteCount}</div>
        <div className="mt-1 text-sm text-zinc-500">Starred high-priority contacts</div>
      </div>
      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-400">Customer Sales</div>
        <div className="mt-2 font-mono text-3xl font-bold text-emerald-400">
          {formatCurrency(totalRevenue)}
        </div>
        <div className="mt-1 text-sm text-zinc-500">{totalTransactions} logged activities</div>
      </div>
    </div>
  )
}
