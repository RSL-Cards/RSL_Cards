import { LineChart } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '@/components/inventory/inventoryUtils'
import { COMP_HISTORY_DATA, SPORT_PERFORMANCE_DATA } from '@/data/mockDashboard'

export default function AIInsightCharts() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="dashboard-card xl:col-span-2">
        <div className="mb-5 flex items-center gap-2">
          <LineChart className="h-5 w-5 text-accent-blue" />
          <h2 className="text-xl font-bold text-white">Comp Trend</h2>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={COMP_HISTORY_DATA}>
              <defs>
                <linearGradient id="compGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0057FF" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0057FF" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#252525" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip
                contentStyle={{
                  background: '#0D0D0D',
                  border: '1px solid #252525',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                }}
                formatter={(value) => [formatCurrency(Number(value)), 'Comp']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#0057FF"
                strokeWidth={2}
                fill="url(#compGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-card">
        <h2 className="text-xl font-bold text-white">Sport Profit Mix</h2>
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={SPORT_PERFORMANCE_DATA} layout="vertical">
              <CartesianGrid stroke="#252525" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} tickFormatter={(value) => `$${value}`} />
              <YAxis dataKey="sport" type="category" stroke="#888888" fontSize={12} tickLine={false} width={78} />
              <Tooltip
                contentStyle={{
                  background: '#0D0D0D',
                  border: '1px solid #252525',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                }}
                formatter={(value) => [formatCurrency(Number(value)), 'Profit']}
              />
              <Bar dataKey="profit" fill="#00C853" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
