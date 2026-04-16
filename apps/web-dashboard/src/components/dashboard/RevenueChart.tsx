'use client'

import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Line } from 'recharts'

interface RevenueChartProps {
  data: Array<{
    date: string
    revenue: number
    profit: number
  }>
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const [period, setPeriod] = useState('15D')

  const periods = ['7D', '15D', '30D', '90D', 'All']

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const revenue = payload.find((p: any) => p.dataKey === 'revenue')
      const profit = payload.find((p: any) => p.dataKey === 'profit')
      const margin = revenue && profit ? ((profit.value / revenue.value) * 100).toFixed(1) : '0'

      return (
        <div className="bg-surface-2 border border-border rounded-lg p-3">
          <div className="text-white font-medium mb-2">{label}</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-text-secondary">Revenue:</span>
              <span className="text-white font-mono">${revenue?.value}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-text-secondary">Profit:</span>
              <span className="text-success font-mono">${profit?.value}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-text-secondary">Margin:</span>
              <span className="text-white font-mono">{margin}%</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-xl">Revenue & Profit — Last {period}</h3>
        
        {/* Period Filter */}
        <div className="flex gap-2">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                period === p
                  ? 'bg-accent-blue text-white'
                  : 'bg-surface-2 text-text-secondary hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0057FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0057FF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00C853" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00C853" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
            <XAxis 
              dataKey="date" 
              stroke="#888888"
              tick={{ fill: '#888888', fontSize: 12 }}
            />
            <YAxis 
              stroke="#888888"
              tick={{ fill: '#888888', fontSize: 12 }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Revenue Bars */}
            <Bar 
              dataKey="revenue" 
              fill="url(#revenueGradient)"
              stroke="#0057FF"
              strokeWidth={1}
            />
            
            {/* Profit Line */}
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#00C853" 
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-surface-2 rounded-lg p-3 text-center">
          <div className="text-text-secondary text-xs mb-1">💡 Best day</div>
          <div className="text-white font-mono text-sm font-bold">Apr 13 at $1,680</div>
        </div>
        <div className="bg-surface-2 rounded-lg p-3 text-center">
          <div className="text-text-secondary text-xs mb-1">💡 Best margin</div>
          <div className="text-white font-mono text-sm font-bold">Apr 2 at 28.3%</div>
        </div>
        <div className="bg-surface-2 rounded-lg p-3 text-center">
          <div className="text-text-secondary text-xs mb-1">💡 Trend</div>
          <div className="text-success font-mono text-sm font-bold">+8.2% vs last month</div>
        </div>
      </div>
    </div>
  )
}
