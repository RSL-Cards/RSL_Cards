'use client'

import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

const revenueData = [
  { date: 'Apr 1', revenue: 880, profit: 210 },
  { date: 'Apr 5', revenue: 1450, profit: 420 },
  { date: 'Apr 10', revenue: 960, profit: 250 },
  { date: 'Apr 15', revenue: 890, profit: 182 },
]

const channelData = [
  { channel: 'Card Shows', revenue: 8200, pct: 44.5, color: '#E8001C' },
  { channel: 'eBay', revenue: 6800, pct: 36.9, color: '#0057FF' },
  { channel: 'Whatnot', revenue: 2100, pct: 11.4, color: '#7B2FFF' },
  { channel: 'TCGPlayer', revenue: 980, pct: 5.3, color: '#00BCD4' },
  { channel: 'Other', revenue: 340, pct: 1.9, color: '#555555' },
]

export default function AnalyticsPreviewSection() {
  return (
    <section className="bg-[#0D0D0D] py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-white font-black text-4xl md:text-5xl mb-4">
            Know your numbers, always
          </h2>
          <p className="text-text-secondary text-lg">
            The analytics dealers wish they had 10 years ago
          </p>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-surface border border-border rounded-2xl p-8"
        >
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Side - Summary Metrics */}
            <div className="lg:col-span-1 space-y-6">
              <h3 className="text-white font-bold text-xl">Summary</h3>
              
              {/* Today */}
              <div className="bg-surface-2 rounded-xl p-4">
                <div className="text-text-secondary text-sm mb-2">Today</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-white font-mono font-bold">$890</div>
                    <div className="text-text-secondary text-xs">Revenue</div>
                  </div>
                  <div>
                    <div className="text-success font-mono font-bold">$182</div>
                    <div className="text-text-secondary text-xs">Profit</div>
                  </div>
                  <div>
                    <div className="text-white font-mono font-bold">28%</div>
                    <div className="text-text-secondary text-xs">Margin</div>
                  </div>
                </div>
              </div>

              {/* This Week */}
              <div className="bg-surface-2 rounded-xl p-4">
                <div className="text-text-secondary text-sm mb-2">This Week</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-white font-mono font-bold">$4,280</div>
                    <div className="text-text-secondary text-xs">Revenue</div>
                  </div>
                  <div>
                    <div className="text-success font-mono font-bold">$1,142</div>
                    <div className="text-text-secondary text-xs">Profit</div>
                  </div>
                  <div>
                    <div className="text-white font-mono font-bold">14</div>
                    <div className="text-text-secondary text-xs">Cards</div>
                  </div>
                </div>
              </div>

              {/* This Month */}
              <div className="bg-surface-2 rounded-xl p-4">
                <div className="text-text-secondary text-sm mb-2">This Month</div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <div className="text-white font-mono font-bold">$18,420</div>
                    <div className="text-text-secondary text-xs">Revenue</div>
                  </div>
                  <div>
                    <div className="text-success font-mono font-bold">$4,890</div>
                    <div className="text-text-secondary text-xs">Profit</div>
                  </div>
                </div>
              </div>

              {/* Profit by Channel */}
              <div>
                <h4 className="text-white font-semibold mb-3">Profit by Channel</h4>
                <div className="space-y-2">
                  {channelData.map((channel, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: channel.color }}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-text-secondary text-sm">{channel.channel}</span>
                          <span className="text-white font-mono text-sm">${channel.revenue.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-surface rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${channel.pct * 2}%`,
                              backgroundColor: channel.color 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Charts */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-white font-bold text-xl">Revenue Trend</h3>
              
              {/* Revenue Chart */}
              <div className="bg-surface-2 rounded-xl p-4">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0057FF" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#0057FF" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00C853" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#00C853" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#888888" />
                    <YAxis stroke="#888888" />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#0057FF" 
                      strokeWidth={2}
                      fill="url(#revenueGradient)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#00C853" 
                      strokeWidth={2}
                      fill="url(#profitGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Mini Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-2 rounded-xl p-4 text-center">
                  <div className="text-success font-mono font-bold text-lg">$1,680</div>
                  <div className="text-text-secondary text-xs">Best Day</div>
                </div>
                <div className="bg-surface-2 rounded-xl p-4 text-center">
                  <div className="text-white font-mono font-bold text-lg">$81</div>
                  <div className="text-text-secondary text-xs">Avg Per Card</div>
                </div>
                <div className="bg-surface-2 rounded-xl p-4 text-center">
                  <div className="text-white font-mono font-bold text-lg">68%</div>
                  <div className="text-text-secondary text-xs">Top Sport: Football</div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Indicators */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-8 right-8 flex items-center gap-2 bg-surface-2 border border-border rounded-full px-3 py-1.5"
          >
            <div className="w-2 h-2 bg-accent-red rounded-full animate-pulse"></div>
            <span className="text-white text-sm">🔴 Live</span>
            <span className="text-text-secondary text-sm">Syncing eBay...</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            className="absolute top-20 right-8 bg-success text-white px-3 py-1.5 rounded-full text-sm font-bold"
          >
            +$61 profit
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
