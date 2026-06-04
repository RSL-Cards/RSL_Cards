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
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
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
          className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition duration-200 hover:border-blue-200 hover:shadow-md sm:p-5"
        >
          <div className="flex flex-col gap-5 md:flex-row">
            <div className="relative mx-auto h-64 w-full max-w-[190px] shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 md:mx-0 md:h-56 md:w-40">
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
                    <h3 className="text-xl font-bold text-gray-900">
                      {card.player_name}
                    </h3>
                    <span className={card.status === 'listed' ? 'rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold capitalize text-green-700' : 'rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700'}>
                      {card.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    {card.year} {card.set_name} - {formatGrade(card.grade_key)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                      {card.sport}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                      ID: {card.id}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                      <Clock3 className="h-3 w-3" />
                      {card.days_held} days held
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 lg:min-w-40 lg:text-right">
                  <div className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Market Value
                  </div>
                  <div className="mt-1 font-mono text-2xl font-bold text-gray-900">
                    {formatCurrency(card.market_value)}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="text-xs text-gray-400">Cost Basis</div>
                  <div className="mt-1 font-mono text-sm font-semibold text-gray-900">
                    {formatCurrency(card.cost_basis)}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="text-xs text-gray-400">Profit/Loss</div>
                  <div className={`mt-1 flex items-center gap-1 font-mono text-sm font-semibold ${card.unrealized_gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {card.unrealized_gain >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {card.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(card.unrealized_gain)}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="text-xs text-gray-400">Comp Avg</div>
                  <div className="mt-1 font-mono text-sm font-semibold text-gray-900">
                    {formatCurrency(card.comp_avg)}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="text-xs text-gray-400">Comp Trend</div>
                  <div className={`mt-1 font-mono text-sm font-semibold ${card.comp_trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {card.comp_trend >= 0 ? '+' : ''}{card.comp_trend}%
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-500">
                  Listed on
                </div>
                <div className="flex flex-wrap gap-2">
                  {card.platforms_listed.length > 0 ? (
                    card.platforms_listed.map((platform) => (
                      <span
                        key={platform}
                        className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                      >
                        {platform}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-400">
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
