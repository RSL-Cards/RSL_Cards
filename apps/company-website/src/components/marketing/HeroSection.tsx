'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play, Star, Users } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-rsl-black">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 gradient-bg">
        <div className="absolute top-0 left-0 w-96 h-96 bg-rsl-red/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-black/50 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 grid-pattern"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-1.5 mb-8"
        >
          <span className="text-white text-sm">🚀 Now serving 12,000+ dealers across the US</span>
        </motion.div>

        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-none">
            <div className="text-white mb-2">The Operating System</div>
            <div className="gradient-text">for Sports Card Dealers</div>
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-text-secondary text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Run your shows. Sell across every platform. Log every dollar.
          The first all-in-one dealer management system built for the card show floor.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <button className="btn-primary text-lg hover:scale-105 transition-transform duration-200">
            Start Free — No Credit Card
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
          <button className="btn-secondary text-lg flex items-center gap-2">
            <Play className="w-5 h-5" />
            Watch Demo
          </button>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="text-text-secondary">Trusted by 12,000+ dealers</div>
          
          <div className="flex items-center gap-2">
            {/* Avatar circles */}
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gray-600 border-2 border-rsl-black flex items-center justify-center text-xs text-white"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span className="text-white text-sm">+12,000</span>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-text-secondary text-sm">
              4.9/5 from 2,400+ reviews
            </span>
          </div>
        </motion.div>

        {/* Hero Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative mt-16"
        >
          {/* Device Mockups */}
          <div className="relative flex justify-center items-end gap-8">
            {/* iPhone Mockup */}
            <div className="relative">
              <div className="w-64 h-[500px] bg-surface rounded-3xl border border-border p-4 shadow-2xl">
                <div className="bg-surface-2 rounded-2xl h-full flex flex-col">
                  <div className="p-4 border-b border-border">
                    <div className="text-white font-bold text-sm">BUY/SELL</div>
                  </div>
                  <div className="flex-1 flex flex-col gap-4 p-4">
                    <button className="bg-accent-blue text-white py-4 rounded-xl font-bold">
                      BUY
                    </button>
                    <button className="bg-accent-red text-white py-4 rounded-xl font-bold">
                      SELL
                    </button>
                    <div className="flex-1 bg-surface rounded-xl p-3">
                      <div className="text-text-secondary text-xs mb-2">Card Details</div>
                      <div className="text-white font-bold text-sm">Patrick Mahomes</div>
                      <div className="text-text-secondary text-xs">PSA 10 • $341</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Laptop Mockup */}
            <div className="relative">
              <div className="w-96 h-[500px] bg-surface rounded-2xl border border-border p-6 shadow-2xl">
                <div className="bg-surface-2 rounded-xl h-full flex flex-col">
                  <div className="p-4 border-b border-border">
                    <div className="text-white font-bold">Dashboard</div>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-surface rounded-lg p-3">
                        <div className="text-text-secondary text-xs">Revenue</div>
                        <div className="text-white font-bold">$890</div>
                      </div>
                      <div className="bg-surface rounded-lg p-3">
                        <div className="text-text-secondary text-xs">Profit</div>
                        <div className="text-success font-bold">$182</div>
                      </div>
                    </div>
                    <div className="bg-surface rounded-lg p-3 h-32">
                      <div className="text-text-secondary text-xs mb-2">Revenue Chart</div>
                      <div className="h-20 bg-gradient-to-t from-accent-blue/20 to-transparent rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Stat Cards */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-8 right-1/4 bg-success text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
          >
            +$182 profit today
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            className="absolute -top-4 left-1/4 bg-accent-blue text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
          >
            47 cards sold
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 2 }}
            className="absolute -bottom-4 right-1/3 bg-surface border border-border px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-success rounded-full"></div>
            Live Comps • eBay: $341
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
