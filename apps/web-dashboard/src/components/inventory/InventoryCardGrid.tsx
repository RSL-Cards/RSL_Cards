'use client'

import Image from 'next/image'
import { Clock3, TrendingDown, TrendingUp } from 'lucide-react'
import { InventoryCard, formatCurrency, formatGrade } from './inventoryUtils'

type Props = {
  cards: InventoryCard[]
  onCardDetail: (card: InventoryCard) => void
}

export default function InventoryCardGrid({ cards, onCardDetail }: Props) {
  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-8 text-center text-sm text-zinc-400 shadow-sm">
        No inventory cards match the current filters.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {cards.map((card) => (
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
            <div className="relative mx-auto h-64 w-full max-w-[190px] shrink-0 overflow-hidden rounded-xl border border-[#252525] bg-[#141414] md:mx-0 md:h-56 md:w-40">
              <Image
                src={card.image_url || '/placeholder.png'}
                alt={card.player_name}
                fill
                sizes="(min-width: 768px) 160px, 190px"
                className="object-contain p-3 transition duration-200 group-hover:scale-[1.03]"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold text-white">
                      {card.player_name}
                    </h3>
                    <span className={card.status === 'listed' ? 'rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-400' : 'rounded-full bg-blue-500/15 border border-blue-500/30 px-2.5 py-1 text-xs font-semibold capitalize text-blue-400'}>
                      {card.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">
                    {card.year} {card.set_name} - {formatGrade(card.grade_key)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#141414] border border-[#252525] px-2.5 py-1 text-xs font-medium text-zinc-300">
                      {card.sport}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#141414] border border-[#252525] px-2.5 py-1 text-xs font-medium text-zinc-300">
                      <Clock3 className="h-3 w-3 text-zinc-400" />
                      {card.days_held} days held
                    </span>
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
                  <div className={`mt-1 flex items-center gap-1 font-mono text-sm font-semibold ${card.unrealized_gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {card.unrealized_gain >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {card.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(card.unrealized_gain)}
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
                  {card.platforms_listed.length > 0 ? (
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
      ))}
    </div>
  )
}
