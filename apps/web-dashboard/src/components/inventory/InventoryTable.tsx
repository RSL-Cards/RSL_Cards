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
      className="inline-flex items-center gap-1 text-left text-xs font-medium uppercase tracking-wider text-text-secondary transition-colors duration-200 hover:text-white"
    >
      {sortLabels[column]}
      {sortKey === column ? (
        sortDirection === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ChevronDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  )

  return (
    <div className="dashboard-card xl:col-span-2">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Card Inventory</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {selectedCount} selected for bulk actions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onListAll}
            className="btn-outline inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
          >
            <CheckCircle2 className="h-4 w-4" />
            List All
          </button>
          <button className="btn-outline inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="btn-danger inline-flex items-center gap-2 text-sm">
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {children}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px]">
          <thead>
            <tr>
              <th className="pb-3 pr-3 text-left">
                <input
                  type="checkbox"
                  checked={cards.length > 0 && selectedIds.length === cards.length}
                  onChange={onSelectAll}
                  className="h-4 w-4 accent-accent-blue"
                />
              </th>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Image</th>
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
          <tbody className="divide-y divide-border">
            {cards.map((card) => {
              const isAging = card.days_held > 60
              const isLosing = card.unrealized_gain < 0
              const rowHighlight = isAging
                ? 'border-l-2 border-accent-red bg-accent-red/10 hover:bg-accent-red/15'
                : isLosing
                  ? 'border-l-2 border-warning bg-warning/10 hover:bg-warning/15'
                  : 'hover:bg-white/5'

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
                      className="h-4 w-4 accent-accent-blue"
                    />
                  </td>
                  <td className="py-3">
                    <div className={`h-14 w-10 rounded-md border border-white/10 bg-gradient-to-br ${cardImageStyle(card)} p-1 shadow-lg`}>
                      <div className="flex h-full flex-col justify-between rounded border border-white/20 bg-black/25 px-1 py-0.5">
                        <span className="truncate text-[8px] font-bold text-white">{card.year}</span>
                        <span className="text-[9px] font-black text-white">{card.player_name.slice(0, 2).toUpperCase()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-semibold text-white">{card.player_name}</div>
                        <div className="text-xs text-text-muted">{card.id}</div>
                      </div>
                      {isAging && (
                        <span className="rounded-full bg-accent-red/20 px-2 py-1 text-xs font-semibold text-accent-red">
                          Aging
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${card.grade_key.includes('PSA') ? 'chip-warning' : card.grade_key.includes('BGS') ? 'chip-blue' : 'bg-gray-500/20 text-gray-400'}`}>
                      {formatGrade(card.grade_key)}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-text-secondary">{card.sport}</td>
                  <td className="py-3 font-mono text-sm text-white">{card.year}</td>
                  <td className="py-3 text-sm text-text-secondary">{card.set_name}</td>
                  <td className="py-3 text-right font-mono text-sm text-white">{formatCurrency(card.cost_basis)}</td>
                  <td className="py-3 text-right font-mono text-sm text-white">{formatCurrency(card.market_value)}</td>
                  <td className="py-3 text-right">
                    <div className={`flex items-center justify-end gap-1 font-mono text-sm font-semibold ${card.unrealized_gain >= 0 ? 'text-success' : 'text-accent-red'}`}>
                      {card.unrealized_gain >= 0 ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      {card.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(card.unrealized_gain)}
                    </div>
                    <div className={`mt-1 inline-flex items-center justify-end rounded-full px-2 py-0.5 font-mono text-xs font-semibold ${card.unrealized_gain_pct >= 0 ? 'bg-success/10 text-success' : 'bg-accent-red/10 text-accent-red'}`}>
                      {card.unrealized_gain_pct >= 0 ? '+' : ''}{card.unrealized_gain_pct}%
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <span className={card.days_held > 60 ? 'chip-danger' : card.days_held > 30 ? 'chip-warning' : 'text-sm text-text-secondary'}>
                      {card.days_held}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {card.platforms_listed.length > 0 ? (
                        card.platforms_listed.map((platform) => (
                          <span key={platform} className="rounded-full bg-white/5 px-2 py-1 text-xs text-text-secondary">
                            {platform}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-text-muted">Not listed</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={card.status === 'listed' ? 'chip-success capitalize' : 'chip-blue capitalize'}>
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
