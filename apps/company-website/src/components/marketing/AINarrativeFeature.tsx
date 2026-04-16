'use client'

import { motion } from 'framer-motion'
import { Zap, TrendingUp } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

const sparklineData = [
  { value: 44 }, { value: 45 }, { value: 46 }, { value: 48 }, 
  { value: 50 }, { value: 54 }, { value: 58 }
]

export default function AINarrativeFeature() {
  return (
    <section className="bg-rsl-black py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-sm font-medium text-amber-500 mb-6">
              <Zap className="w-4 h-4" />
              AI Powered
            </div>
            
            <h2 className="text-white font-black text-4xl md:text-5xl mb-6">
              Know WHY prices move, not just what moved
            </h2>
            
            <p className="text-text-secondary text-lg mb-8 leading-relaxed">
              Every other tool tells you what happened to card prices. RSL Cards tells you WHY — 
              player performance, news, seasonal trends — all explained in plain English.
            </p>

            {/* Feature List */}
            <div className="space-y-4 mb-8">
              {[
                'Real-time price anomaly detection',
                'Correlated with player stats and news',
                'Personalized to your inventory',
                'Timing recommendations for selling'
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white">{feature}</span>
                </motion.div>
              ))}
            </div>

            <button className="btn-primary flex items-center gap-2">
              Get AI Insights
              <TrendingUp className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Right Side - AI Narrative Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* AI Card */}
            <div className="bg-surface border border-border rounded-2xl p-8 relative overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent"></div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-rsl-red text-white text-xs px-3 py-1 rounded-full font-bold">
                    AI INSIGHT
                  </div>
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>

                {/* Type Badge */}
                <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1 text-sm font-medium text-orange-500 mb-4">
                  BREAKOUT
                </div>

                {/* Headline */}
                <h3 className="text-white font-bold text-2xl mb-4">
                  Jayden Daniels rookies surge 18% after record-breaking game
                </h3>

                {/* Body */}
                <p className="text-text-secondary leading-relaxed mb-6">
                  Daniels threw for 342 yards and 4 TDs Sunday, setting a rookie record. 
                  PSA 10 Prizm Silvers jumped from $48 to $58 within 48 hours as collectors 
                  rush to buy before prices climb higher.
                </p>

                {/* Price Chart */}
                <div className="bg-surface-2 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-text-secondary text-sm">Price Movement</span>
                    <span className="text-success font-mono text-sm">+18.2%</span>
                  </div>
                  <ResponsiveContainer width="100%" height={60}>
                    <AreaChart data={sparklineData}>
                      <defs>
                        <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00C853" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#00C853" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#00C853" 
                        strokeWidth={2}
                        fill="url(#sparklineGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center">
                  <div className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
                    3 cards in your inventory affected
                  </div>
                  <div className="text-text-muted text-sm">
                    Published 2 hours ago
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-xl"
            ></motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
