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
  data = []
}: RevenueChartProps) {

  const [period, setPeriod] = useState('15D')

  const periods = ['7D', '15D', '30D', '90D', 'All']

  // 1. Best Day Calculation
  const bestDayItem = data.reduce((best, item) => {
    return item.revenue > (best?.revenue || 0) ? item : best;
  }, null as any);

  const bestDayText = bestDayItem && bestDayItem.revenue > 0
    ? `${bestDayItem.date} at $${bestDayItem.revenue.toLocaleString()}`
    : 'N/A';

  // 2. Best Margin Calculation
  const bestMarginItem = data.reduce((best, item) => {
    if (item.revenue <= 0) return best;
    const itemMargin = (item.profit / item.revenue) * 100;
    const bestMargin = best ? (best.profit / best.revenue) * 100 : -Infinity;
    return itemMargin > bestMargin ? item : best;
  }, null as any);

  const bestMarginText = bestMarginItem
    ? `${bestMarginItem.date} at ${((bestMarginItem.profit / bestMarginItem.revenue) * 100).toFixed(1)}%`
    : 'N/A';

  // 3. Trend Calculation (Second Half vs First Half of the selected period)
  const mid = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, mid);
  const secondHalf = data.slice(mid);
  const firstHalfSum = firstHalf.reduce((acc, d) => acc + d.revenue, 0);
  const secondHalfSum = secondHalf.reduce((acc, d) => acc + d.revenue, 0);
  
  let trendPct = 0;
  if (firstHalfSum > 0) {
    trendPct = ((secondHalfSum - firstHalfSum) / firstHalfSum) * 100;
  } else if (secondHalfSum > 0) {
    trendPct = 100;
  }

  const hasTrend = data.length >= 2 && (firstHalfSum > 0 || secondHalfSum > 0);
  const trendText = hasTrend
    ? `${trendPct >= 0 ? '+' : ''}${trendPct.toFixed(1)}% vs last period`
    : 'N/A';

  const isTrendPositive = trendPct >= 0;
  const trendCardBg = !hasTrend
    ? 'bg-[#141414] border-[#252525]'
    : isTrendPositive
      ? 'bg-emerald-500/10 border-emerald-500/20'
      : 'bg-red-500/10 border-red-500/20';

  const trendLabelColor = !hasTrend
    ? 'text-zinc-500'
    : isTrendPositive
      ? 'text-emerald-400'
      : 'text-red-400';

  const trendValueColor = !hasTrend
    ? 'text-white'
    : isTrendPositive
      ? 'text-emerald-400'
      : 'text-red-400';

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
        <div className="bg-[#141414] border border-[#252525] shadow-2xl rounded-2xl px-4 py-3 min-w-[180px]">

          <div className="text-white font-semibold mb-3">
            {label}
          </div>

          <div className="space-y-2 text-sm">

            <div className="flex justify-between gap-6">
              <span className="text-zinc-400">
                Revenue
              </span>

              <span className="text-white font-mono font-medium">
                ${revenue?.value}
              </span>
            </div>

            <div className="flex justify-between gap-6">
              <span className="text-zinc-400">
                Profit
              </span>

              <span className="text-emerald-400 font-mono font-medium">
                ${profit?.value}
              </span>
            </div>

            <div className="flex justify-between gap-6">
              <span className="text-zinc-400">
                Margin
              </span>

              <span className="text-white font-mono font-medium">
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
    <div className="dashboard-card bg-[#0D0D0D] border border-[#252525] rounded-3xl p-7 shadow-sm">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

        <div>
          <h3 className="text-white font-bold text-2xl tracking-tight">
            Revenue & Profit
          </h3>

          <div className="text-zinc-400 text-sm mt-1">
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
                    ? 'bg-[#E8001C] text-white border-[#E8001C] shadow-sm'
                    : 'bg-[#141414] text-zinc-400 border-[#252525] hover:bg-[#1A1A1A] hover:text-white'
                }
              `}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[340px] w-full rounded-2xl bg-[#09090B] border border-[#252525] p-4">

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
                  stopColor="#0057FF"
                  stopOpacity={0.25}
                />

                <stop
                  offset="95%"
                  stopColor="#0057FF"
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
                  stopColor="#10B981"
                  stopOpacity={0.25}
                />

                <stop
                  offset="95%"
                  stopColor="#10B981"
                  stopOpacity={0}
                />
              </linearGradient>

            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#252525"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tick={{
                fill: '#A1A1AA',
                fontSize: 12
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{
                fill: '#A1A1AA',
                fontSize: 12
              }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              cursor={{
                fill: 'rgba(255,255,255,0.03)'
              }}
              content={<CustomTooltip />}
            />

            {/* Revenue */}
            <Bar
              dataKey="revenue"
              fill="url(#revenueGradient)"
              stroke="#0057FF"
              strokeWidth={1}
              radius={[8, 8, 0, 0]}
              barSize={28}
            />

            {/* Profit */}
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#10B981"
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

        <div className="bg-[#141414] border border-[#252525] rounded-2xl px-5 py-4 text-center">

          <div className="text-zinc-400 text-xs uppercase tracking-wide mb-2">
            Best Day
          </div>

          <div className="text-white font-semibold text-sm">
            {bestDayText}
          </div>
        </div>

        <div className="bg-[#141414] border border-[#252525] rounded-2xl px-5 py-4 text-center">

          <div className="text-zinc-400 text-xs uppercase tracking-wide mb-2">
            Best Margin
          </div>

          <div className="text-white font-semibold text-sm">
            {bestMarginText}
          </div>
        </div>

        <div className={`${trendCardBg} border rounded-2xl px-5 py-4 text-center`}>

          <div className={`${trendLabelColor} text-xs uppercase tracking-wide mb-2`}>
            Trend
          </div>

          <div className={`${trendValueColor} font-semibold text-sm`}>
            {trendText}
          </div>
        </div>
      </div>
    </div>
  )
}