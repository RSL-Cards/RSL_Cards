'use client'

import {
  AlertTriangle,
  TrendingDown
} from 'lucide-react'

interface PortfolioHealthProps {
  totalCards: number
  listedCards: number
  unlistedCards: number
  gainingValue: number
  losingValue: number
  agingAlerts: number
  totalCost: number
  totalValue: number
  totalGain: number
  totalGainPct: number
  agingCards: Array<{
    player: string
    grade: string
    daysHeld: number
    change: number
  }>
}

export default function PortfolioHealth({
  totalCards,
  listedCards,
  unlistedCards,
  gainingValue,
  losingValue,
  agingAlerts,
  totalCost,
  totalValue,
  totalGain,
  totalGainPct,
  agingCards
}: PortfolioHealthProps) {

  const gainingPct =
    totalCards > 0
      ? (gainingValue / totalCards) * 100
      : 0

  const losingPct =
    totalCards > 0
      ? (losingValue / totalCards) * 100
      : 0

  const portfolioGrowth =
    (totalValue / totalCost) * 100

  return (
    <div className="dashboard-card bg-[#0D0D0D] border border-[#252525] rounded-3xl p-7 shadow-sm">

      {/* Header */}
      <div className="mb-7">

        <h3 className="text-white font-bold text-2xl tracking-tight">
          Portfolio Snapshot
        </h3>

        <div className="text-zinc-400 text-sm mt-1">
          Overall portfolio performance and health
        </div>
      </div>

      {/* Health Metrics */}
      <div className="bg-[#141414] border border-[#252525] rounded-2xl p-5 mb-7">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">

          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">
              Total Cards
            </span>

            <span className="text-white font-semibold">
              {totalCards}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">
              Listed
            </span>

            <span className="text-white font-semibold">
              {listedCards}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">
              Unlisted
            </span>

            <span className="text-white font-semibold">
              {unlistedCards}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">
              Gaining Value
            </span>

            <span className="text-emerald-400 font-semibold">
              {gainingValue} ({gainingPct.toFixed(0)}%)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">
              Losing Value
            </span>

            <span className="text-red-400 font-semibold">
              {losingValue} ({losingPct.toFixed(0)}%)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">
              Aging Alerts
            </span>

            <span className="text-amber-400 font-semibold">
              {agingAlerts}
            </span>
          </div>
        </div>
      </div>

      {/* Portfolio Value */}
      <div className="mb-8">

        <div className="flex items-center justify-between mb-3">

          <span className="text-zinc-400 text-sm font-medium">
            Portfolio Value
          </span>

          <span className="text-white font-mono font-semibold">
            ${totalValue.toLocaleString()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-10 bg-[#141414] rounded-full overflow-hidden border border-[#252525]">

          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#E8001C] to-red-600 rounded-full flex items-center justify-end px-4 shadow-sm"
            style={{
              width: `${Math.min(portfolioGrowth, 100)}%`
            }}
          >

            <span className="text-white text-xs font-semibold tracking-wide">
              Market Value
            </span>
          </div>
        </div>

        {/* Labels */}
        <div className="flex items-center justify-between mt-3">

          <span className="text-zinc-400 text-sm font-mono">
            ${totalCost.toLocaleString()}
          </span>

          <span className="text-white text-sm font-mono font-semibold">
            ${totalValue.toLocaleString()}
          </span>
        </div>

        {/* Growth */}
        <div className="flex items-center justify-center mt-4">

          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold">
            +${totalGain.toLocaleString()} ({totalGainPct.toFixed(1)}%)
          </div>
        </div>
      </div>

      {/* Aging Alerts */}
      {agingCards.length > 0 && (
        <div>

          <div className="flex items-center gap-2 mb-4">

            <AlertTriangle className="w-5 h-5 text-amber-400" />

            <h4 className="text-white font-semibold text-lg">
              Aging Alert Cards
            </h4>
          </div>

          <div className="space-y-3">

            {agingCards.map((card, index) => (
              <div
                key={index}
                className="
                  bg-amber-500/10
                  border
                  border-amber-500/20
                  rounded-2xl
                  p-4
                  flex
                  items-center
                  justify-between
                  transition-all
                  duration-200
                "
              >

                <div>

                  <div className="text-white font-semibold">
                    {card.player}
                  </div>

                  <div className="text-zinc-400 text-sm mt-1">
                    {card.grade} • {card.daysHeld} days held
                  </div>
                </div>

                <div className="flex items-center gap-1 text-red-400 text-sm font-semibold">

                  <TrendingDown className="w-4 h-4" />

                  {card.change}%
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            className="
              w-full
              mt-5
              bg-[#141414]
              hover:bg-[#1A1A1A]
              text-white
              border
              border-[#252525]
              rounded-2xl
              py-3
              text-sm
              font-semibold
              transition-all
              duration-200
            "
          >
            Review Aging Cards →
          </button>
        </div>
      )}
    </div>
  )
}