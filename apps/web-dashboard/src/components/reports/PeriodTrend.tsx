'use client'

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { NormalizedRevenuePoint } from './reportsTypes'

interface PeriodTrendProps {
  revenueData: NormalizedRevenuePoint[]
  sportPerformanceData: Array<{
    sport: string
    profit: number
    percentage: number
  }>
}

export default function PeriodTrend({ revenueData, sportPerformanceData }: PeriodTrendProps) {
  return (
    <div className="dashboard-card">
      <h2 className="mb-5 text-xl font-bold text-white">Period Performance Trend</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenueData}>
            <CartesianGrid stroke="#252525" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#888888" tick={{ fill: '#888888', fontSize: 12 }} />
            <YAxis stroke="#888888" tick={{ fill: '#888888', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#252525', borderRadius: 8 }}
              formatter={(value) => formatCurrency(Number(value))}
            />
            <Legend />
            <Line dataKey="revenue" name="Revenue" stroke="#0057FF" strokeWidth={3} dot={false} />
            <Line dataKey="profit" name="Profit" stroke="#00C853" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        {sportPerformanceData.map((sport) => (
          <div key={sport.sport} className="rounded-lg bg-surface-2 p-4">
            <div className="text-sm font-semibold text-white">{sport.sport}</div>
            <div className="mt-2 font-mono text-xl font-bold text-success">
              {formatCurrency(sport.profit)}
            </div>
            <div className="mt-1 text-xs text-text-muted">{sport.percentage}% of sport profit</div>
          </div>
        ))}
      </div>
    </div>
  )
}
