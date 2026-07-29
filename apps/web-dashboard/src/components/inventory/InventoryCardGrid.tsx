'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Clock3, TrendingDown, TrendingUp, Trash2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { GRADE_CONFIG, InventoryCard, formatCurrency, formatGrade, getGradeConfig } from './inventoryUtils'
import { inventoryService } from '@/services/inventoryService'
import { dashboardKeys } from '@/hooks/dashboard/useDashboard'
import ConfirmModal from '@/components/ui/ConfirmModal'

type Props = {
  cards: InventoryCard[]
  onCardDetail: (card: InventoryCard) => void
}

export default function InventoryCardGrid({ cards, onCardDetail }: Props) {
  const queryClient = useQueryClient()
  const [cardToDelete, setCardToDelete] = useState<InventoryCard | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteConfirm = async () => {
    if (!cardToDelete) return
    setIsDeleting(true)
    try {
      await inventoryService.deleteItem(cardToDelete.id)
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      setCardToDelete(null)
    } catch (err) {
      console.error(err)
    } finally {
      setIsDeleting(false)
    }
  }
  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-8 text-center text-sm text-zinc-400 shadow-sm">
        No inventory cards match the current filters.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {cards.map((card) => {
        const gradeCfg = getGradeConfig(card.grade_key, card)
        const cost = card.cost_basis || 0
        const market = card.market_value || 0
        const unrealizedGain = card.unrealized_gain ?? (market - cost)
        const unrealizedGainPct = cost > 0 && market > 0 ? Math.round((unrealizedGain / cost) * 100) : 0

        return (
          <div
            key={card.id}
            role="button"
            tabIndex={0}
            onClick={() => onCardDetail(card)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onCardDetail(card)
              }
            }}
            className="group cursor-pointer rounded-2xl border border-[#252525] bg-[#0D0D0D] p-4 shadow-sm transition duration-200 hover:border-[#333] hover:shadow-md sm:p-5"
          >
            <div className="flex flex-col gap-5 md:flex-row">
              {/* Thumbnail with Quantity Badge */}
              <div className="relative mx-auto h-64 w-full max-w-[190px] shrink-0 overflow-hidden rounded-xl border border-[#252525] bg-[#141414] md:mx-0 md:h-56 md:w-40">
                <Image
                  src={card.image_url || '/placeholder.png'}
                  alt={card.player_name}
                  fill
                  sizes="(min-width: 768px) 160px, 190px"
                  className="object-contain p-3 transition duration-200 group-hover:scale-[1.03]"
                />
                {card.quantity && card.quantity > 1 ? (
                  <span className="absolute top-2 right-2 rounded-md bg-black/80 border border-white/20 px-2 py-0.5 font-mono text-[11px] font-bold text-white shadow-md">
                    &times;{card.quantity}
                  </span>
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-xl font-bold text-white truncate">
                        {card.player_name}
                      </h3>
                      {/* Styled Grade Chip */}
                      <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs tracking-wide uppercase ${gradeCfg.badgeStyle}`}>
                        {gradeCfg.label}
                      </span>
                      {/* Status Badge */}
                      <span className={card.status === 'listed' ? 'rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold capitalize text-emerald-400' : 'rounded-full bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 text-xs font-semibold capitalize text-blue-400'}>
                        {card.status}
                      </span>
                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCardToDelete(card)
                        }}
                        title="Delete card from inventory"
                        className="ml-auto inline-flex items-center justify-center p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Set Name / Year / Variation / Card Number */}
                    <p className="mt-1 text-sm leading-6 text-zinc-300 font-medium">
                      {card.year ? `${card.year} ` : ''}{card.set_name}
                      {card.variation ? <span className="text-zinc-400"> &bull; {card.variation}</span> : null}
                      {card.card_number ? <span className="text-zinc-400"> &bull; #{card.card_number}</span> : null}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#141414] border border-[#252525] px-2.5 py-1 text-xs font-medium text-zinc-300">
                        {card.sport}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#141414] border border-[#252525] px-2.5 py-1 text-xs font-medium text-zinc-300">
                        <Clock3 className="h-3 w-3 text-zinc-400" />
                        {card.days_held} days held
                      </span>
                      {card.cert_number && (
                        <span className="rounded-full bg-zinc-900 border border-zinc-700 px-2.5 py-1 text-xs font-mono text-zinc-400">
                          Cert #{card.cert_number}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#252525] bg-[#141414] px-4 py-3 lg:min-w-40 lg:text-right">
                    <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Your Target Price
                    </div>
                    <div className="mt-1 font-mono text-2xl font-bold text-white">
                      {formatCurrency(card.market_value)}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <div className="rounded-xl border border-[#252525] bg-[#141414] p-3">
                    <div className="text-xs text-zinc-400">Cost Basis</div>
                    <div className="mt-1 font-mono text-sm font-semibold text-white">
                      {formatCurrency(card.cost_basis)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#252525] bg-[#141414] p-3">
                    <div className="text-xs text-zinc-400">Profit/Loss</div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className={`flex items-center gap-1 font-mono text-sm font-semibold ${unrealizedGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {unrealizedGain >= 0 ? (
                          <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 shrink-0" />
                        )}
                        {unrealizedGain >= 0 ? '+' : ''}{formatCurrency(unrealizedGain)}
                      </div>
                      {market > 0 && (
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-mono font-bold border ${unrealizedGain >= 0 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}>
                          {unrealizedGainPct >= 0 ? '+' : ''}{unrealizedGainPct}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#252525] bg-[#141414] p-3">
                    <div className="text-xs text-zinc-400">Comp Avg</div>
                    <div className="mt-1 font-mono text-sm font-semibold text-white">
                      {card.comp_avg && card.comp_avg > 0 ? formatCurrency(card.comp_avg) : 'N/A'}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#252525] bg-[#141414] p-3">
                    <div className="text-xs text-zinc-400">Comp Trend</div>
                    <div className={`mt-1 font-mono text-sm font-semibold ${card.comp_avg && card.comp_avg > 0 && card.comp_trend >= 0 ? 'text-emerald-400' : card.comp_avg && card.comp_avg > 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                      {card.comp_avg && card.comp_avg > 0 ? `${card.comp_trend >= 0 ? '+' : ''}${card.comp_trend}%` : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Active & Sold Listing Comp Ranges */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-[#252525] pt-4">
                  <div className="flex justify-between items-center bg-[#141414] px-3.5 py-2 rounded-lg border border-[#252525] text-xs">
                    <span className="font-semibold text-zinc-400 uppercase tracking-wide text-[10px]">Active Range</span>
                    <span className="font-mono text-white font-bold">
                      {card.lowest_active && card.highest_active 
                        ? `${formatCurrency(card.lowest_active)} - ${formatCurrency(card.highest_active)}` 
                        : card.lowest_active 
                          ? `${formatCurrency(card.lowest_active)}+` 
                          : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-[#141414] px-3.5 py-2 rounded-lg border border-[#252525] text-xs">
                    <span className="font-semibold text-zinc-400 uppercase tracking-wide text-[10px]">Sold Range (30D)</span>
                    <span className="font-mono text-white font-bold">
                      {card.lowest_sold && card.highest_sold 
                        ? `${formatCurrency(card.lowest_sold)} - ${formatCurrency(card.highest_sold)}` 
                        : card.lowest_sold 
                          ? `${formatCurrency(card.lowest_sold)}+` 
                          : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 border-t border-[#252525] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-zinc-400">
                    Listed on
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {card.platforms_listed && card.platforms_listed.length > 0 ? (
                      card.platforms_listed.map((platform) => (
                        <span
                          key={platform}
                          className="rounded-full bg-[#141414] border border-[#252525] px-2.5 py-1 text-xs font-medium text-zinc-300"
                        >
                          {platform}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-[#141414] border border-[#252525] px-2.5 py-1 text-xs font-medium text-zinc-500">
                        Not listed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      <ConfirmModal
        isOpen={!!cardToDelete}
        title="Delete Card from Inventory"
        message={`Are you sure you want to delete "${cardToDelete?.player_name || 'this card'}" from your inventory? Comps and player info will remain saved.`}
        confirmText="Delete Card"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setCardToDelete(null)}
      />
    </div>
  )
}
