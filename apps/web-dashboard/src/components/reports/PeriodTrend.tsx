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
    <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
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
            <Line dataKey="revenue" name="Revenue" stroke="#E8001C" strokeWidth={3} dot={false} />
            <Line dataKey="profit" name="Profit" stroke="#10B981" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        {sportPerformanceData.map((sport) => (
          <div key={sport.sport} className="rounded-lg border border-[#252525] bg-[#141414] p-4">
            <div className="text-sm font-semibold text-white">{sport.sport}</div>
            <div className="mt-2 font-mono text-xl font-bold text-emerald-400">
              {formatCurrency(sport.profit)}
            </div>
            <div className="mt-1 text-xs text-zinc-400">{sport.percentage}% of sport profit</div>
          </div>
        ))}
      </div>
    </div>
  )
}
