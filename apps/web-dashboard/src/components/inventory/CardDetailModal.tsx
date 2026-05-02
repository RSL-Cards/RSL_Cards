'use client'

import { AI_INSIGHTS, COMP_HISTORY_DATA, RECENT_TRANSACTIONS } from '@/data/mockDashboard'
import { CalendarClock, LineChart, ReceiptText, Sparkles, X } from 'lucide-react'
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
  cardImageStyle,
  formatCurrency,
  formatGrade,
  InventoryCard,
  platformOptions,
} from './inventoryUtils'

interface CardDetailModalProps {
  card: InventoryCard
  onClose: () => void
}

export default function CardDetailModal({ card, onClose }: CardDetailModalProps) {
  const priceTrendData = COMP_HISTORY_DATA.map((point) => ({
    ...point,
    price: Math.round((point.price / COMP_HISTORY_DATA[COMP_HISTORY_DATA.length - 1].price) * card.market_value),
  }))

  const matchingSoldComps = RECENT_TRANSACTIONS.filter((transaction) => {
    const transactionPlayer = transaction.player.toLowerCase()
    const cardPlayer = card.player_name.toLowerCase()

    return (
      transaction.type === 'sell' &&
      (transactionPlayer.includes(cardPlayer.split(' ')[0]) ||
        cardPlayer.includes(transactionPlayer.split(' ')[0]))
    )
  })

  const soldComps = matchingSoldComps.length > 0
    ? matchingSoldComps
    : [
      {
        id: `${card.id}-comp-1`,
        channel: 'eBay',
        grade: formatGrade(card.grade_key),
        margin: card.unrealized_gain_pct,
        payment: 'eBay',
        player: card.player_name,
        price: card.comp_avg,
        profit: card.unrealized_gain,
        time: 'Apr 15',
        type: 'sell',
      },
      {
        id: `${card.id}-comp-2`,
        channel: 'Card Show',
        grade: formatGrade(card.grade_key),
        margin: card.unrealized_gain_pct - 3.4,
        payment: 'Cash',
        player: card.player_name,
        price: Math.max(1, Math.round(card.comp_avg * 0.96)),
        profit: Math.round(card.unrealized_gain * 0.82),
        time: 'Apr 9',
        type: 'sell',
      },
      {
        id: `${card.id}-comp-3`,
        channel: 'Whatnot',
        grade: formatGrade(card.grade_key),
        margin: card.unrealized_gain_pct + 2.1,
        payment: 'Whatnot',
        player: card.player_name,
        price: Math.round(card.comp_avg * 1.03),
        profit: Math.round(card.unrealized_gain * 1.08),
        time: 'Apr 2',
        type: 'sell',
      },
    ]

  const matchedInsight = AI_INSIGHTS.find((insight) =>
    card.player_name.toLowerCase().includes(insight.player.toLowerCase().split(' ')[0])
  )
  const aiNarrative = matchedInsight?.body ??
    `${card.player_name} is currently valued at ${formatCurrency(card.market_value)}, with comps averaging ${formatCurrency(card.comp_avg)} and a ${card.comp_trend >= 0 ? 'positive' : 'negative'} ${Math.abs(card.comp_trend)}% market trend. ${card.days_held > 60 ? 'The card is aging in inventory, so listing or repricing should be reviewed.' : 'Holding period is still manageable, so monitor daily revaluation before making a pricing move.'}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className={`h-24 w-16 rounded-lg border border-white/10 bg-gradient-to-br ${cardImageStyle(card)} p-2`}>
              <div className="flex h-full flex-col justify-between rounded border border-white/20 bg-black/25 p-1">
                <span className="font-mono text-xs font-bold text-white">{card.year}</span>
                <span className="text-lg font-black text-white">{card.player_name.slice(0, 2).toUpperCase()}</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{card.player_name}</h2>
              <p className="mt-1 text-text-secondary">
                {card.year} {card.set_name} - {formatGrade(card.grade_key)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={card.status === 'listed' ? 'chip-success capitalize' : 'chip-blue capitalize'}>
                  {card.status}
                </span>
                <span className="rounded-full bg-white/5 px-2 py-1 text-xs font-medium text-text-secondary">
                  {card.sport}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors duration-200 hover:border-white hover:text-white"
            aria-label="Close card details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-white/5 p-4">
            <div className="text-sm text-text-secondary">Cost Basis</div>
            <div className="mt-1 font-mono text-xl font-bold text-white">{formatCurrency(card.cost_basis)}</div>
          </div>
          <div className="rounded-lg border border-border bg-white/5 p-4">
            <div className="text-sm text-text-secondary">Market Value</div>
            <div className="mt-1 font-mono text-xl font-bold text-white">{formatCurrency(card.market_value)}</div>
          </div>
          <div className="rounded-lg border border-border bg-white/5 p-4">
            <div className="text-sm text-text-secondary">Profit/Loss</div>
            <div className={`mt-1 font-mono text-xl font-bold ${card.unrealized_gain >= 0 ? 'text-success' : 'text-accent-red'}`}>
              {card.unrealized_gain >= 0 ? '+' : ''}{formatCurrency(card.unrealized_gain)}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-white/5 p-4">
            <div className="text-sm text-text-secondary">Days Held</div>
            <div className="mt-1 font-mono text-xl font-bold text-white">{card.days_held}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-white/5 p-4">
            <div className="mb-3 flex items-center gap-2 font-semibold text-white">
              <CalendarClock className="h-4 w-4 text-accent-blue" />
              Valuation Snapshot
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Comp average</span>
                <span className="font-mono text-white">{formatCurrency(card.comp_avg)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Comp trend</span>
                <span className={card.comp_trend >= 0 ? 'text-success' : 'text-accent-red'}>
                  {card.comp_trend >= 0 ? '+' : ''}{card.comp_trend}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Daily revaluation</span>
                <span className="text-success">Active</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-white/5 p-4">
            <div className="mb-3 font-semibold text-white">Listing Channels</div>
            <div className="flex flex-wrap gap-2">
              {platformOptions.map((platform) => {
                const listed = card.platforms_listed.includes(platform)
                return (
                  <span
                    key={platform}
                    className={listed ? 'chip-success' : 'rounded-full bg-white/5 px-2 py-1 text-xs font-medium text-text-muted'}
                  >
                    {platform}
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="rounded-lg border border-border bg-white/5 p-4 lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-white">
                <LineChart className="h-4 w-4 text-accent-blue" />
                Price Trend
              </div>
              <span className={card.comp_trend >= 0 ? 'text-sm font-medium text-success' : 'text-sm font-medium text-accent-red'}>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
                  <XAxis dataKey="date" stroke="#888888" tick={{ fill: '#888888', fontSize: 11 }} />
                  <YAxis
                    stroke="#888888"
                    tick={{ fill: '#888888', fontSize: 11 }}
                    tickFormatter={(value) => `$${value}`}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#141414',
                      border: '1px solid #252525',
                      borderRadius: '0.5rem',
                      color: '#FFFFFF',
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

          <div className="rounded-lg border border-border bg-white/5 p-4 lg:col-span-2">
            <div className="mb-4 flex items-center gap-2 font-semibold text-white">
              <ReceiptText className="h-4 w-4 text-success" />
              Last Sold Comps
            </div>
            <div className="space-y-3">
              {soldComps.slice(0, 3).map((comp) => (
                <div key={comp.id} className="rounded-lg border border-border bg-surface/70 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-white">{comp.channel}</div>
                      <div className="mt-1 text-xs text-text-secondary">
                        {comp.grade} - {comp.time}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-white">{formatCurrency(comp.price)}</div>
                      <div className={Number(comp.profit) >= 0 ? 'text-xs text-success' : 'text-xs text-accent-red'}>
                        {Number(comp.profit) >= 0 ? '+' : ''}{formatCurrency(Number(comp.profit))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-accent-blue/20 bg-accent-blue/10 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Sparkles className="h-4 w-4 text-accent-blue" />
              AI Narrative
            </div>
            <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-medium text-text-secondary">
              {matchedInsight?.recommendation ?? (card.comp_trend >= 0 ? 'HOLD' : 'REPRICE')}
            </span>
          </div>
          <p className="text-sm leading-6 text-text-secondary">{aiNarrative}</p>
        </div>
      </div>
    </div>
  )
}
