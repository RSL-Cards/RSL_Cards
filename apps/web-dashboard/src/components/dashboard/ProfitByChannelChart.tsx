'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface ProfitByChannelChartProps {
  data: Array<{
    channel: string
    revenue: number
    profit: number
    pct: number
    color: string
  }>
}

export default function ProfitByChannelChart({ data }: ProfitByChannelChartProps) {
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-surface-2 border border-border rounded-lg p-3">
          <div className="text-white font-medium mb-2">{data.channel}</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-text-secondary">Revenue:</span>
              <span className="text-white font-mono">${data.revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-text-secondary">Percentage:</span>
              <span className="text-white font-mono">{data.pct}%</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (percent < 0.05) return null // Hide labels for small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    )
  }

  return (
    <div className="dashboard-card">
      <h3 className="text-white font-bold text-xl mb-6">Sales by Channel</h3>
      
      {/* Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="revenue"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-white text-sm">{item.channel}</span>
            </div>
            <div className="text-right">
              <div className="text-white font-mono text-sm">
                ${item.revenue.toLocaleString()}
              </div>
              <div className="text-text-muted text-xs">
                {item.pct}%
              </div>
            </div>
          </div>
        ))}
        
        {/* Total */}
        <div className="border-t border-border pt-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold">Total</span>
            <span className="text-white font-mono font-bold">
              ${totalRevenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Best Channel */}
      <div className="mt-4 p-3 bg-surface-2 rounded-lg">
        <div className="text-text-secondary text-xs mb-1">Best Channel</div>
        <div className="text-white font-semibold">
          {data.reduce((max, item) => item.revenue > max.revenue ? item : max).channel}
        </div>
      </div>
    </div>
  )
}
