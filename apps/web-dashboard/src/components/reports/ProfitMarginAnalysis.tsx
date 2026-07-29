'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { chartColors, marginLabels } from './reportsUtils'
import { MarginDimension, MarginReportItem } from './reportsTypes'

interface ProfitMarginAnalysisProps {
  marginData: MarginReportItem[]
  marginDimension: MarginDimension
  onMarginDimensionChange: (dimension: MarginDimension) => void
}

const dimensions: MarginDimension[] = ['sport', 'year', 'grade', 'platform']

export default function ProfitMarginAnalysis({
  marginData,
  marginDimension,
  onMarginDimensionChange,
}: ProfitMarginAnalysisProps) {
  const hasData = marginData && marginData.length > 0 && marginData.some(item => (item.cards && item.cards > 0) || (item.value && item.value > 0) || (item.profit && item.profit !== 0));

  return (
    <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-white">Profit Margin Analysis</h2>
        <div className="flex flex-wrap gap-2">
          {dimensions.map((dimension) => (
            <button
              key={dimension}
              type="button"
              onClick={() => onMarginDimensionChange(dimension)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                marginDimension === dimension
                  ? 'bg-[#E8001C] text-white'
                  : 'bg-[#141414] text-zinc-400 hover:text-white border border-[#252525]'
              }`}
            >
              {marginLabels[dimension]}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[#252525] rounded-xl bg-[#141414] my-4">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#0D0D0D] text-zinc-500 border border-[#252525]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white">No cards in inventory</h3>
          <p className="mt-1 max-w-sm text-xs text-zinc-400">
            No profit margin or sales data tracked by {marginLabels[marginDimension].toLowerCase()} for this time period.
          </p>
        </div>
      ) : (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marginData}>
                <CartesianGrid stroke="#252525" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#888888" tick={{ fill: '#888888', fontSize: 12 }} />
                <YAxis stroke="#888888" tick={{ fill: '#888888', fontSize: 12 }} />
                <Tooltip
                  cursor={{ stroke: '#252525', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: '#0D0D0D', borderColor: '#252525', borderRadius: 12, color: '#FFF' }}
                  formatter={(value, name) =>
                    name === 'margin' ? `${Number(value).toFixed(1)}%` : formatCurrency(Number(value))
                  }
                />
                <Line
                  dataKey="margin"
                  name="Margin"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10B981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {marginData.slice(0, 4).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between rounded-lg border border-[#252525] bg-[#141414] p-3">
                <div className="flex items-center gap-3">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  <div>
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-xs text-zinc-400">{item.cards} cards tracked</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm text-emerald-400">{item.margin.toFixed(1)}%</div>
                  <div className="font-mono text-xs text-zinc-400">{formatCurrency(item.profit)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
