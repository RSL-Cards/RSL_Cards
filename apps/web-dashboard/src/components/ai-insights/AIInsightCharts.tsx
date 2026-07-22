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
      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm xl:col-span-2">
        <div className="mb-5 flex items-center gap-2">
          <LineChart className="h-5 w-5 text-[#E8001C]" />
          <h2 className="text-xl font-bold text-white">Comp Trend</h2>
        </div>
        
        {activeCompHistory.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center border border-dashed border-[#252525] rounded-xl bg-[#141414] text-center p-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E8001C]/15 text-[#E8001C]">
              <LineChart className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No pricing trends available</h3>
            <p className="mt-1 max-w-sm text-xs text-zinc-400">
              Select an RSL signal from the feed to view 30-day historical comp pricing trends and transaction volume.
            </p>
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeCompHistory}>
                <defs>
                  <linearGradient id="compGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E8001C" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#E8001C" stopOpacity={0.02} />
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
                  stroke="#E8001C"
                  strokeWidth={2}
                  fill="url(#compGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-sm">
        <h2 className="text-xl font-bold text-white">Sport Profit Mix</h2>
        
        {activeSportProfitMix.length === 0 ? (
          <div className="mt-5 h-72 flex flex-col items-center justify-center border border-dashed border-[#252525] rounded-xl bg-[#141414] text-center p-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white">No profit mix data</h3>
            <p className="mt-1 max-w-xs text-xs text-zinc-400">
              No completed card sales recorded yet to compile a profit distribution breakdown by sport.
            </p>
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
                <Bar dataKey="profit" fill="#10B981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
