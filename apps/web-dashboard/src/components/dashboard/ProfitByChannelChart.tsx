'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

interface ProfitByChannelChartProps {
  data: Array<{
    channel: string
    revenue: number
    profit: number
    pct: number
    color: string
  }>
}

export default function ProfitByChannelChart({
  data
}: ProfitByChannelChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="dashboard-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center h-[520px]">
        <div className="text-gray-500 text-sm">No sales data available.</div>
      </div>
    )
  }

  const totalRevenue = data.reduce(
    (sum, item) => sum + item.revenue,
    0
  )

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload

      return (
        <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-4">
          <div className="text-gray-900 font-semibold mb-3">
            {data.channel}
          </div>

          <div className="space-y-2 text-sm">

            <div className="flex justify-between gap-6">
              <span className="text-gray-500">
                Revenue
              </span>

              <span className="text-gray-900 font-mono font-medium">
                ${data.revenue.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between gap-6">
              <span className="text-gray-500">
                Profit
              </span>

              <span className="text-green-600 font-mono font-medium">
                ${data.profit.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between gap-6">
              <span className="text-gray-500">
                Share
              </span>

              <span className="text-gray-900 font-mono font-medium">
                {data.pct}%
              </span>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  const CustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: any) => {

    const RADIAN = Math.PI / 180

    const radius =
      innerRadius +
      (outerRadius - innerRadius) * 0.55

    const x =
      cx + radius * Math.cos(-midAngle * RADIAN)

    const y =
      cy + radius * Math.sin(-midAngle * RADIAN)

    if (percent < 0.06) return null

    return (
      <text
        x={x}
        y={y}
        fill="#ffffff"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const bestChannel = data.reduce((max, item) =>
    item.revenue > max.revenue ? item : max
  )

  return (
    <div className="dashboard-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">

        <div>
          <h3 className="text-gray-900 font-bold text-2xl tracking-tight">
            Sales by Channel
          </h3>

          <div className="text-gray-500 text-sm mt-1">
            Revenue distribution across marketplaces
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
          <span className="text-blue-700 text-xs font-semibold">
            {data.length} Channels
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={95}
              innerRadius={55}
              paddingAngle={3}
              dataKey="revenue"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="space-y-3">

        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
          >

            <div className="flex items-center gap-3">

              <div
                className="w-3 h-3 rounded-full shadow-sm"
                style={{
                  backgroundColor: item.color
                }}
              />

              <div>
                <div className="text-gray-900 text-sm font-medium">
                  {item.channel}
                </div>

                <div className="text-gray-400 text-xs">
                  {item.pct}% of revenue
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-gray-900 font-mono text-sm font-semibold">
                ${item.revenue.toLocaleString()}
              </div>

              <div className="text-green-600 text-xs font-medium">
                +${item.profit.toLocaleString()} profit
              </div>
            </div>
          </div>
        ))}

        {/* Total */}
        <div className="border-t border-gray-100 pt-4 mt-2">
          <div className="flex items-center justify-between">

            <span className="text-gray-900 font-semibold">
              Total Revenue
            </span>

            <span className="text-gray-900 font-mono font-bold text-lg">
              ${totalRevenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Best Channel */}
      <div className="mt-5 bg-gray-50 border border-gray-200 rounded-2xl p-4">

        <div className="text-gray-500 text-xs uppercase tracking-wide mb-2">
          Best Performing Channel
        </div>

        <div className="flex items-center justify-between">

          <div>
            <div className="text-gray-900 font-semibold text-lg">
              {bestChannel.channel}
            </div>

            <div className="text-gray-500 text-sm mt-1">
              Highest revenue contribution
            </div>
          </div>

          <div className="text-right">
            <div className="text-blue-600 font-bold text-lg">
              {bestChannel.pct}%
            </div>

            <div className="text-gray-400 text-xs">
              share
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}