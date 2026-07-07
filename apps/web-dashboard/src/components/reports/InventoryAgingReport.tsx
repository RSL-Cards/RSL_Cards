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
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-bold text-gray-900">Inventory Aging Report</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {agingData.map((band) => (
          <div key={band.name} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm font-semibold text-gray-900">{band.name}</div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-gray-400">Cards</div>
                <div className="font-mono text-gray-900">{band.cards}</div>
              </div>
              <div>
                <div className="text-gray-400">Value</div>
                <div className="font-mono text-gray-900">{formatCurrency(band.value)}</div>
              </div>
              <div>
                <div className="text-gray-400">Avg</div>
                <div className="font-mono text-gray-900">{band.avgDays}d</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-4 py-3">Card</th>
              <th className="px-4 py-3">Held</th>
              <th className="px-4 py-3">P/L</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {oldestCards.map((card) => (
              <tr key={card.id}>
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900">{card.player_name}</div>
                  <div className="text-xs text-gray-400">
                    {card.year} {card.set_name}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-gray-900">{card.days_held}d</td>
                <td className={`px-4 py-3 font-mono ${card.unrealized_gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {card.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(card.unrealized_gain)}
                </td>
                <td className="px-4 py-3">
                  <span className={card.status === 'listed' ? 'inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700' : 'inline-flex items-center gap-1 rounded-full border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-xs font-semibold text-yellow-700'}>
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
