'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { PlatformSales } from './reportsTypes'

interface SalesByPlatformChartProps {
  salesByPlatform: PlatformSales[]
}

export default function SalesByPlatformChart({ salesByPlatform }: SalesByPlatformChartProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-900">Sales by Platform</h2>
        <div className="text-sm text-gray-400">Bar chart by marketplace</div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={salesByPlatform}>
            <CartesianGrid stroke="#252525" strokeDasharray="3 3" />
            <XAxis dataKey="platform" stroke="#888888" tick={{ fill: '#888888', fontSize: 12 }} />
            <YAxis stroke="#888888" tick={{ fill: '#888888', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#252525', borderRadius: 8 }}
              formatter={(value) => formatCurrency(Number(value))}
            />
            <Legend />
            <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]}>
              {salesByPlatform.map((entry) => (
                <Cell key={entry.platform} fill={entry.color} />
              ))}
            </Bar>
            <Bar dataKey="profit" name="Profit" fill="#00C853" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
