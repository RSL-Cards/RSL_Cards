'use client'

import { useMemo } from 'react'
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
import { Store, BarChart2 } from 'lucide-react'

interface SalesByPlatformChartProps {
  salesByPlatform: PlatformSales[]
}

export default function SalesByPlatformChart({ salesByPlatform }: SalesByPlatformChartProps) {
  const totalRevenue = useMemo(() => {
    return salesByPlatform.reduce((sum, item) => sum + (item.revenue || 0), 0)
  }, [salesByPlatform])

  const totalProfit = useMemo(() => {
    return salesByPlatform.reduce((sum, item) => sum + (item.profit || 0), 0)
  }, [salesByPlatform])

  const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  return (
    <div className="rounded-3xl border border-[#252525] bg-[#0D0D0D] p-6 shadow-xl w-full">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#252525] pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Sales &amp; Profit by Platform</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Performance comparison across sales channels</p>
          </div>
        </div>

        {/* Quick Summary Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="rounded-xl border border-[#252525] bg-[#141414] px-3.5 py-1.5 text-xs">
            <span className="text-zinc-400 font-medium">Total Sales: </span>
            <span className="font-mono font-bold text-white ml-1">{formatCurrency(totalRevenue)}</span>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3.5 py-1.5 text-xs">
            <span className="text-emerald-400 font-medium">Total Profit: </span>
            <span className="font-mono font-bold text-emerald-400 ml-1">{formatCurrency(totalProfit)}</span>
          </div>
          {overallMargin > 0 && (
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/15 px-3 py-1.5 text-xs font-mono font-bold text-blue-400">
              {overallMargin.toFixed(1)}% Margin
            </div>
          )}
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="h-80 w-full">
        {salesByPlatform.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesByPlatform} barGap={6} barSize={28} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00C853" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#00C853" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#252525" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="platform"
                stroke="#71717A"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#252525' }}
              />
              <YAxis
                stroke="#71717A"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#252525' }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as PlatformSales
                    const margin = data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : '0'

                    return (
                      <div className="rounded-2xl border border-[#333] bg-[#0D0D0D]/95 p-3.5 shadow-2xl backdrop-blur-md text-xs min-w-[170px]">
                        <div className="font-bold text-white border-b border-[#252525] pb-1.5 mb-2 flex items-center justify-between">
                          <span>{data.platform}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
                            {margin}% margin
                          </span>
                        </div>
                        <div className="space-y-1 font-mono">
                          <div className="flex items-center justify-between text-zinc-300">
                            <span>Revenue:</span>
                            <span className="font-bold text-white">{formatCurrency(data.revenue)}</span>
                          </div>
                          <div className="flex items-center justify-between text-emerald-400">
                            <span>Profit:</span>
                            <span className="font-bold">{formatCurrency(data.profit)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '15px' }}
                formatter={(value) => <span className="text-xs font-semibold text-zinc-300">{value}</span>}
              />
              <Bar dataKey="revenue" name="Revenue" radius={[8, 8, 0, 0]}>
                {salesByPlatform.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#0057FF'} />
                ))}
              </Bar>
              <Bar dataKey="profit" name="Profit" fill="url(#profitGrad)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#252525] bg-[#141414] text-center p-6">
            <BarChart2 className="w-10 h-10 text-zinc-600 mb-2" />
            <p className="text-sm font-semibold text-zinc-400">No platform sales data available</p>
            <p className="text-xs text-zinc-500 mt-1">Platform metrics will appear here after recording transactions.</p>
          </div>
        )}
      </div>

      {/* Platform Cards Breakdown */}
      {salesByPlatform.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-[#252525]">
          {salesByPlatform.map((p) => {
            const pMargin = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0
            return (
              <div key={p.platform} className="rounded-2xl border border-[#252525] bg-[#141414] p-3.5 hover:border-[#333] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color || '#0057FF' }} />
                  <span className="text-xs font-bold text-white truncate">{p.platform}</span>
                </div>
                <div className="font-mono text-sm font-extrabold text-white">{formatCurrency(p.revenue)}</div>
                <div className="flex items-center justify-between text-[11px] mt-1">
                  <span className="text-emerald-400 font-mono font-bold">+{formatCurrency(p.profit)}</span>
                  <span className="text-zinc-500 font-mono">{pMargin.toFixed(0)}%</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
