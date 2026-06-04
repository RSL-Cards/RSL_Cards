'use client'

import { CalendarClock, LineChart, ReceiptText, Sparkles, Trash2, X } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  formatCurrency,
  formatGrade,
  InventoryCard,
  platformOptions,
} from './inventoryUtils'
import Image from 'next/image'
interface CardDetailModalProps {
  card: InventoryCard
  error?: string | null
  isLoading?: boolean
  onClose: () => void
  onDelete: (card: InventoryCard) => void
}

export default function CardDetailModal({
  card,
  error,
  isLoading = false,
  onClose,
  onDelete,
}: CardDetailModalProps) {
  const priceTrendData = Array.from({ length: 12 }, (_, index) => {
    const progress = index / 11
    const start = Math.max(1, card.cost_basis || card.market_value)
    const price = Math.round(start + (card.market_value - start) * progress)

    return {
      date: `P${index + 1}`,
      price,
    }
  })
  const aiNarrative = `${card.player_name} is currently valued at ${formatCurrency(card.market_value)}, with a recorded cost basis of ${formatCurrency(card.cost_basis)} and ${card.unrealized_gain >= 0 ? 'an unrealized gain' : 'an unrealized loss'} of ${formatCurrency(Math.abs(card.unrealized_gain))}. ${card.days_held > 60 ? 'This card is aging in inventory, so listing or repricing should be reviewed.' : 'Holding period is still manageable, so monitor revaluation before making a pricing move.'}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4">
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDelete(card)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-600 hover:border-red-300 hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm hover:border-gray-300 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isLoading && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            Loading latest card details...
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 relative flex flex-col items-center justify-center">
          <div className="flex flex-col items-center text-center">

            {/* BIG IMAGE */}
            <div className="relative mb-4 h-80 w-56 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <Image
                src={card.image_url || '/placeholder.png'}
                alt={card.player_name}
                fill
                className="object-contain p-2"
              />
            </div>

            {/* NAME */}
            <h2 className="text-2xl font-bold text-gray-950">
              {card.player_name}
            </h2>

            {/* DETAILS */}
            <p className="mt-1 text-gray-500">
              {card.year} {card.set_name} - {formatGrade(card.grade_key)}
            </p>

            {/* TAGS */}
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <span className={card.status === 'listed' ? 'chip-success capitalize' : 'chip-blue capitalize'}>
                {card.status}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                {card.sport}
              </span>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-500">Cost Basis</div>
            <div className="mt-1 font-mono text-xl font-bold text-gray-950">{formatCurrency(card.cost_basis)}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-500">Market Value</div>
            <div className="mt-1 font-mono text-xl font-bold text-gray-950">{formatCurrency(card.market_value)}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-500">Profit/Loss</div>
            <div className={`mt-1 font-mono text-xl font-bold ${card.unrealized_gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {card.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(card.unrealized_gain)}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm text-gray-500">Days Held</div>
            <div className="mt-1 font-mono text-xl font-bold text-gray-950">{card.days_held}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 font-semibold text-gray-950">
              <CalendarClock className="h-4 w-4 text-blue-600" />
              Valuation Snapshot
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Comp average</span>
                <span className="font-mono text-gray-950">{formatCurrency(card.comp_avg)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Comp trend</span>
                <span className={card.comp_trend >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {card.comp_trend >= 0 ? '+' : ''}{card.comp_trend}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Daily revaluation</span>
                <span className="text-green-600">Active</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 font-semibold text-gray-950">Listing Channels</div>
            <div className="flex flex-wrap gap-2">
              {platformOptions.map((platform) => {
                const listed = card.platforms_listed.includes(platform)
                return (
                  <span
                    key={platform}
                    className={listed ? 'chip-success' : 'rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-400'}
                  >
                    {platform}
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-gray-950">
                <LineChart className="h-4 w-4 text-blue-600" />
                Price Trend
              </div>
              <span className={card.comp_trend >= 0 ? 'text-sm font-medium text-green-600' : 'text-sm font-medium text-red-600'}>
                {card.comp_trend >= 0 ? '+' : ''}{card.comp_trend}% last 90 days
              </span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceTrendData}>
                  <defs>
                    <linearGradient id={`cardTrend-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0057FF" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0057FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <YAxis
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                    tickFormatter={(value) => `$${value}`}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.5rem',
                      color: '#111827',
                    }}
                    formatter={(value) => [formatCurrency(Number(value)), 'Market value']}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#0057FF"
                    strokeWidth={2}
                    fill={`url(#cardTrend-${card.id})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center gap-2 font-semibold text-gray-950">
              <ReceiptText className="h-4 w-4 text-green-600" />
              Inventory Record
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Quantity</span>
                <span className="font-mono text-gray-950">{card.quantity ?? 1}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Card number</span>
                <span className="font-mono text-gray-950">{card.card_number ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Variation</span>
                <span className="text-gray-950">{card.variation ?? 'Base'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Certification</span>
                <span className="font-mono text-gray-950">{card.cert_number ?? 'N/A'}</span>
              </div>
              {card.notes && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-600">
                  {card.notes}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold text-gray-950">
              <Sparkles className="h-4 w-4 text-blue-600" />
              AI Narrative
            </div>
            <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-600 shadow-sm">
              {card.days_held > 60 || card.unrealized_gain < 0 ? 'REVIEW' : 'HOLD'}
            </span>
          </div>
          <p className="text-sm leading-6 text-gray-600">{aiNarrative}</p>
        </div>
      </div>
    </div>
  )
}
