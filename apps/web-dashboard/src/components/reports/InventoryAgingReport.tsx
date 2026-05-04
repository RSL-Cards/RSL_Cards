import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { AgingReportItem, OldestCard } from './reportsTypes'

interface InventoryAgingReportProps {
  agingData: AgingReportItem[]
  oldestCards: OldestCard[]
}

export default function InventoryAgingReport({
  agingData,
  oldestCards,
}: InventoryAgingReportProps) {
  return (
    <div className="dashboard-card">
      <h2 className="mb-6 text-xl font-bold text-white">Inventory Aging Report</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {agingData.map((band) => (
          <div key={band.name} className="rounded-lg border border-border bg-white/5 p-4">
            <div className="text-sm font-semibold text-white">{band.name}</div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-text-muted">Cards</div>
                <div className="font-mono text-white">{band.cards}</div>
              </div>
              <div>
                <div className="text-text-muted">Value</div>
                <div className="font-mono text-white">{formatCurrency(band.value)}</div>
              </div>
              <div>
                <div className="text-text-muted">Avg</div>
                <div className="font-mono text-white">{band.avgDays}d</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-2 text-xs uppercase text-text-muted">
            <tr>
              <th className="px-4 py-3">Card</th>
              <th className="px-4 py-3">Held</th>
              <th className="px-4 py-3">P/L</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {oldestCards.map((card) => (
              <tr key={card.id}>
                <td className="px-4 py-3">
                  <div className="font-semibold text-white">{card.player_name}</div>
                  <div className="text-xs text-text-muted">
                    {card.year} {card.set_name}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-white">{card.days_held}d</td>
                <td className={`px-4 py-3 font-mono ${card.unrealized_gain >= 0 ? 'text-success' : 'text-accent-red'}`}>
                  {card.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(card.unrealized_gain)}
                </td>
                <td className="px-4 py-3">
                  <span className={card.status === 'listed' ? 'chip-blue' : 'chip-warning'}>
                    {card.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
