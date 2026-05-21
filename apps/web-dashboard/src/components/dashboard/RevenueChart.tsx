'use client'

import { useState } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Line
} from 'recharts'

interface RevenueChartProps {
  data: Array<{
    date: string
    revenue: number
    profit: number
  }>
}

export default function RevenueChart({
  data
}: RevenueChartProps) {

  const [period, setPeriod] = useState('15D')

  const periods = ['7D', '15D', '30D', '90D', 'All']

  const CustomTooltip = ({
    active,
    payload,
    label
  }: any) => {

    if (active && payload && payload.length) {

      const revenue = payload.find(
        (p: any) => p.dataKey === 'revenue'
      )

      const profit = payload.find(
        (p: any) => p.dataKey === 'profit'
      )

      const margin =
        revenue && profit
          ? ((profit.value / revenue.value) * 100).toFixed(1)
          : '0'

      return (
        <div className="bg-white border border-gray-200 shadow-xl rounded-2xl px-4 py-3 min-w-[180px]">

          <div className="text-gray-900 font-semibold mb-3">
            {label}
          </div>

          <div className="space-y-2 text-sm">

            <div className="flex justify-between gap-6">
              <span className="text-gray-500">
                Revenue
              </span>

              <span className="text-gray-900 font-mono font-medium">
                ${revenue?.value}
              </span>
            </div>

            <div className="flex justify-between gap-6">
              <span className="text-gray-500">
                Profit
              </span>

              <span className="text-green-600 font-mono font-medium">
                ${profit?.value}
              </span>
            </div>

            <div className="flex justify-between gap-6">
              <span className="text-gray-500">
                Margin
              </span>

              <span className="text-gray-900 font-mono font-medium">
                {margin}%
              </span>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="dashboard-card bg-white border border-gray-200 rounded-3xl p-7 shadow-sm hover:shadow-md transition-all duration-300">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

        <div>
          <h3 className="text-gray-900 font-bold text-2xl tracking-tight">
            Revenue & Profit
          </h3>

          <div className="text-gray-500 text-sm mt-1">
            Financial performance overview
          </div>
        </div>

        {/* Period Filters */}
        <div className="flex items-center gap-2 flex-wrap">

          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`
                px-4
                py-2
                rounded-xl
                text-sm
                font-medium
                transition-all
                duration-200
                border
                ${
                  period === p
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[340px] w-full rounded-2xl bg-gray-50/50 border border-gray-100 p-4">

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0
            }}
          >

            <defs>

              <linearGradient
                id="revenueGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#3B82F6"
                  stopOpacity={0.18}
                />

                <stop
                  offset="95%"
                  stopColor="#3B82F6"
                  stopOpacity={0}
                />
              </linearGradient>

              <linearGradient
                id="profitGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#22C55E"
                  stopOpacity={0.18}
                />

                <stop
                  offset="95%"
                  stopColor="#22C55E"
                  stopOpacity={0}
                />
              </linearGradient>

            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tick={{
                fill: '#6B7280',
                fontSize: 12
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{
                fill: '#6B7280',
                fontSize: 12
              }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              cursor={{
                fill: 'rgba(59,130,246,0.05)'
              }}
              content={<CustomTooltip />}
            />

            {/* Revenue */}
            <Bar
              dataKey="revenue"
              fill="url(#revenueGradient)"
              stroke="#3B82F6"
              strokeWidth={1}
              radius={[8, 8, 0, 0]}
              barSize={28}
            />

            {/* Profit */}
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#22C55E"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 0
              }}
            />

          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-7">

        <div className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-center">

          <div className="text-gray-500 text-xs uppercase tracking-wide mb-2">
            Best Day
          </div>

          <div className="text-gray-900 font-semibold text-sm">
            Apr 13 at $1,680
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-center">

          <div className="text-gray-500 text-xs uppercase tracking-wide mb-2">
            Best Margin
          </div>

          <div className="text-gray-900 font-semibold text-sm">
            Apr 2 at 28.3%
          </div>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4 text-center">

          <div className="text-green-600 text-xs uppercase tracking-wide mb-2">
            Monthly Trend
          </div>

          <div className="text-green-700 font-semibold text-sm">
            +8.2% vs last month
          </div>
        </div>
      </div>
    </div>
  )
}