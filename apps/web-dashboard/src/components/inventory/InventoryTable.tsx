import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  Download,
  TrendingDown,
  TrendingUp,
  Trash2,
} from 'lucide-react'
import { ReactNode } from 'react'
import {
  cardImageStyle,
  formatCurrency,
  formatGrade,
  getGradeConfig,
  GRADE_CONFIG,
  InventoryCard,
  SortDirection,
  SortKey,
  sortLabels,
} from './inventoryUtils'

interface InventoryTableProps {
  cards: InventoryCard[]
  children: ReactNode
  selectedCount: number
  selectedIds: string[]
  sortDirection: SortDirection
  sortKey: SortKey
  onCardDetail: (card: InventoryCard) => void
  onListAll: () => void
  onSelectAll: () => void
  onSort: (key: SortKey) => void
  onToggleSelected: (cardId: string) => void
}

export default function InventoryTable({
  cards,
  children,
  selectedCount,
  selectedIds,
  sortDirection,
  sortKey,
  onCardDetail,
  onListAll,
  onSelectAll,
  onSort,
  onToggleSelected,
}: InventoryTableProps) {
  const SortButton = ({ column }: { column: SortKey }) => (
    <button
      type="button"
      onClick={() => onSort(column)}
      className="inline-flex items-center gap-1 text-left text-xs font-medium uppercase tracking-wider text-zinc-400 transition-colors duration-200 hover:text-white"
    >
      {sortLabels[column]}
      {sortKey === column ? (
        sortDirection === 'asc' ? (
          <ArrowUp className="h-3 w-3 text-white" />
        ) : (
          <ArrowDown className="h-3 w-3 text-white" />
        )
      ) : (
        <ChevronDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  )

  return (
    <div className="dashboard-card bg-[#0D0D0D] border border-[#252525] rounded-2xl p-6 shadow-sm xl:col-span-2">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Card Inventory</h2>
          <p className="mt-1 text-sm text-zinc-400">
            {selectedCount} selected for bulk actions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onListAll}
            className="inline-flex items-center gap-2 rounded-xl bg-[#141414] border border-[#252525] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#1A1A1A] transition-colors"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            List All
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-[#141414] border border-[#252525] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#1A1A1A] transition-colors">
            <Download className="h-4 w-4 text-blue-400" />
            Export
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-red-500/15 border border-red-500/30 px-3.5 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/25 transition-colors">
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {children}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px]">
          <thead>
            <tr className="border-b border-[#252525]">
              <th className="pb-3 pr-3 text-left">
                <input
                  type="checkbox"
                  checked={cards.length > 0 && selectedIds.length === cards.length}
                  onChange={onSelectAll}
                  className="h-4 w-4 accent-[#E8001C]"
                />
              </th>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">Image</th>
              {Object.keys(sortLabels).map((key) => (
                <th
                  key={key}
                  className={`pb-3 text-left ${['cost_basis', 'market_value', 'unrealized_gain', 'days_held'].includes(key) ? 'text-right' : ''}`}
                >
                  <SortButton column={key as SortKey} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252525]">
            {cards.map((card) => {
              const isAging = card.days_held > 60
              const isLosing = card.unrealized_gain < 0
              const rowHighlight = isAging
                ? 'border-l-2 border-red-500 bg-red-500/10 hover:bg-red-500/20'
                : isLosing
                  ? 'border-l-2 border-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
                  : 'hover:bg-[#141414]/70'

              const gradeCfg = getGradeConfig(card.grade_key, card)

              return (
                <tr
                  key={card.id}
                  onClick={() => onCardDetail(card)}
                  className={`cursor-pointer transition-colors duration-200 ${rowHighlight}`}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onCardDetail(card)
                    }
                  }}
                >
                  <td className="py-3 pr-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(card.id)}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => onToggleSelected(card.id)}
                      className="h-4 w-4 accent-[#E8001C]"
                    />
                  </td>
                  <td className="py-3">
                    <div className={`h-14 w-10 rounded-md border border-[#252525] bg-gradient-to-br ${cardImageStyle(card)} p-1 shadow-lg relative`}>
                      <div className="flex h-full flex-col justify-between rounded border border-white/20 bg-black/40 px-1 py-0.5">
                        <span className="truncate text-[8px] font-bold text-white">{card.year}</span>
                        <span className="text-[9px] font-black text-white">{card.player_name.slice(0, 2).toUpperCase()}</span>
                      </div>
                      {card.quantity && card.quantity > 1 ? (
                        <span className="absolute -top-1.5 -right-1.5 rounded bg-black border border-white/30 px-1 py-0.2 font-mono text-[9px] font-bold text-white">
                          &times;{card.quantity}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-semibold text-white">{card.player_name}</div>
                        <div className="text-xs text-zinc-500">{card.id}</div>
                      </div>
                      {isAging && (
                        <span className="rounded-full bg-red-500/15 border border-red-500/30 px-2 py-0.5 text-xs font-semibold text-red-400">
                          Aging
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-xs tracking-wide uppercase border ${gradeCfg.badgeStyle}`}>
                      {gradeCfg.label}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-zinc-400">{card.sport}</td>
                  <td className="py-3 font-mono text-sm text-white">{card.year}</td>
                  <td className="py-3 text-sm text-zinc-400">
                    <div>{card.set_name}</div>
                    {card.variation || card.card_number ? (
                      <div className="text-xs text-zinc-500">
                        {card.variation ? card.variation : ''}{card.variation && card.card_number ? ' · ' : ''}{card.card_number ? `#${card.card_number}` : ''}
                      </div>
                    ) : null}
                  </td>
                  <td className="py-3 text-right font-mono text-sm text-white">{formatCurrency(card.cost_basis)}</td>
                  <td className="py-3 text-right font-mono text-sm text-white">{formatCurrency(card.market_value)}</td>
                  <td className="py-3 text-right">
                    <div className={`flex items-center justify-end gap-1 font-mono text-sm font-semibold ${card.unrealized_gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {card.unrealized_gain >= 0 ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      {card.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(card.unrealized_gain)}
                    </div>
                    <div className={`mt-1 inline-flex items-center justify-end rounded-full px-2 py-0.5 font-mono text-xs font-semibold border ${card.unrealized_gain_pct >= 0 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}>
                      {card.unrealized_gain_pct >= 0 ? '+' : ''}{card.unrealized_gain_pct}%
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold border ${card.days_held > 60 ? 'bg-red-500/15 text-red-400 border-red-500/30' : card.days_held > 30 ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'text-zinc-400 border-transparent'}`}>
                      {card.days_held}d
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {card.platforms_listed.length > 0 ? (
                        card.platforms_listed.map((platform) => (
                          <span key={platform} className="rounded-full bg-[#141414] border border-[#252525] px-2 py-0.5 text-xs text-zinc-300">
                            {platform}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-500">Not listed</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border capitalize ${card.status === 'listed' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/15 text-blue-400 border-blue-500/30'}`}>
                      {card.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
