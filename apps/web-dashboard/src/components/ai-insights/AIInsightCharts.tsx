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

interface AIInsightChartsProps {
  compHistory?: Array<{ date: string; price: number }>;
  sportProfitMix?: Array<{ sport: string; profit: number }>;
}

export default function AIInsightCharts({ compHistory, sportProfitMix }: AIInsightChartsProps) {
  const activeCompHistory = compHistory || [];
  const activeSportProfitMix = sportProfitMix || [];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
        <div className="mb-5 flex items-center gap-2">
          <LineChart className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Comp Trend</h2>
        </div>
        
        {activeCompHistory.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <LineChart className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 font-medium">Select an insight to view 30-day historical pricing trends</p>
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeCompHistory}>
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
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Sport Profit Mix</h2>
        
        {activeSportProfitMix.length === 0 ? (
          <div className="mt-5 h-72 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <p className="text-sm text-gray-500 font-medium text-center px-4">No completed sales recorded to compile a profit mix by sport</p>
          </div>
        ) : (
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeSportProfitMix} layout="vertical">
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
        )}
      </div>
    </div>
  )
}
