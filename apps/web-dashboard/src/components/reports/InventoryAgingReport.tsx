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
    <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-bold text-white">Inventory Aging Report</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {agingData.map((band) => (
          <div key={band.name} className="rounded-lg border border-[#252525] bg-[#141414] p-4">
            <div className="text-sm font-semibold text-white">{band.name}</div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-zinc-500">Cards</div>
                <div className="font-mono text-white">{band.cards}</div>
              </div>
              <div>
                <div className="text-zinc-500">Value</div>
                <div className="font-mono text-white">{formatCurrency(band.value)}</div>
              </div>
              <div>
                <div className="text-zinc-500">Avg</div>
                <div className="font-mono text-white">{band.avgDays}d</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#252525]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#141414] text-xs uppercase text-zinc-400 border-b border-[#252525]">
            <tr>
              <th className="px-4 py-3">Card</th>
              <th className="px-4 py-3">Held</th>
              <th className="px-4 py-3">P/L</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252525]">
            {oldestCards.map((card) => (
              <tr key={card.id}>
                <td className="px-4 py-3">
                  <div className="font-semibold text-white">{card.player_name}</div>
                  <div className="text-xs text-zinc-400">
                    {card.year} {card.set_name}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-white">{card.days_held}d</td>
                <td className={`px-4 py-3 font-mono ${card.unrealized_gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {card.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(card.unrealized_gain)}
                </td>
                <td className="px-4 py-3">
                  <span className={card.status === 'listed' ? 'inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-400' : 'inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-400'}>
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
