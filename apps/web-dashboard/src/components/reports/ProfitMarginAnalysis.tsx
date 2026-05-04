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
  return (
    <div className="dashboard-card">
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
                  ? 'bg-accent-blue text-white'
                  : 'bg-surface-2 text-text-secondary hover:text-white'
              }`}
            >
              {marginLabels[dimension]}
            </button>
          ))}
        </div>
      </div>
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
          <div key={item.name} className="flex items-center justify-between rounded-lg bg-surface-2 p-3">
            <div className="flex items-center gap-3">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: chartColors[index % chartColors.length] }}
              />
              <div>
                <div className="font-semibold text-white">{item.name}</div>
                <div className="text-xs text-text-muted">{item.cards} cards tracked</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm text-success">{item.margin.toFixed(1)}%</div>
              <div className="font-mono text-xs text-text-muted">{formatCurrency(item.profit)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
