'use client'

import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'

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
  const gainingPct = totalCards > 0 ? (gainingValue / totalCards * 100) : 0
  const losingPct = totalCards > 0 ? (losingValue / totalCards * 100) : 0

  return (
    <div className="dashboard-card">
      <h3 className="text-white font-bold text-xl mb-6">Portfolio Snapshot</h3>
      
      {/* Health Metrics */}
      <div className="bg-surface-2 border border-border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Total Cards:</span>
            <span className="text-white font-medium">{totalCards}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Listed:</span>
            <span className="text-white font-medium">{listedCards}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Unlisted:</span>
            <span className="text-white font-medium">{unlistedCards}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Gaining value:</span>
            <span className="text-success font-medium">{gainingValue} ({gainingPct.toFixed(0)}%)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Losing value:</span>
            <span className="text-accent-red font-medium">{losingValue} ({losingPct.toFixed(0)}%)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Aging alerts:</span>
            <span className="text-warning font-medium">{agingAlerts}</span>
          </div>
        </div>
      </div>

      {/* Portfolio Value Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-text-secondary">Cost Basis</span>
          <span className="text-white font-mono">${totalCost.toLocaleString()}</span>
        </div>
        <div className="relative h-8 bg-surface-2 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full flex items-center justify-end pr-3"
            style={{ width: `${(totalValue / totalCost) * 100}%` }}
          >
            <span className="text-white text-xs font-mono font-bold">Market Value</span>
          </div>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-text-secondary">${totalCost.toLocaleString()}</span>
          <span className="text-white font-mono">${totalValue.toLocaleString()}</span>
        </div>
        <div className="text-center mt-2">
          <span className="text-success font-bold text-mono">
            +${totalGain.toLocaleString()} (+{totalGainPct.toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Aging Alerts */}
      {agingCards.length > 0 && (
        <div>
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Aging Alert Cards
          </h4>
          <div className="space-y-2">
            {agingCards.map((card, index) => (
              <div 
                key={index}
                className="bg-warning/5 border border-warning/20 rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <div className="text-white font-medium">{card.player}</div>
                  <div className="text-text-secondary text-sm">
                    {card.grade} • {card.daysHeld} days held
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-accent-red text-sm font-medium">
                    <TrendingDown className="w-3 h-3" />
                    {card.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-3 text-accent-blue hover:text-blue-400 text-sm font-medium transition-colors duration-200">
            Review Aging Cards →
          </button>
        </div>
      )}
    </div>
  )
}
