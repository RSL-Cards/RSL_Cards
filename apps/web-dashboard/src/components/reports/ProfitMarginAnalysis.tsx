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
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-900">Profit Margin Analysis</h2>
        <div className="flex flex-wrap gap-2">
          {dimensions.map((dimension) => (
            <button
              key={dimension}
              type="button"
              onClick={() => onMarginDimensionChange(dimension)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                marginDimension === dimension
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-500 hover:text-gray-900'
              }`}
            >
              {marginLabels[dimension]}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/60 my-4">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900">No cards in inventory</h3>
          <p className="mt-1 max-w-sm text-xs text-gray-500">
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
                  contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#252525', borderRadius: 8 }}
                  formatter={(value, name) =>
                    name === 'margin' ? `${Number(value).toFixed(1)}%` : formatCurrency(Number(value))
                  }
                />
                <Line
                  dataKey="margin"
                  name="Margin"
                  stroke="#00C853"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#00C853' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {marginData.slice(0, 4).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <div className="flex items-center gap-3">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.cards} cards tracked</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm text-green-600">{item.margin.toFixed(1)}%</div>
                  <div className="font-mono text-xs text-gray-400">{formatCurrency(item.profit)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
