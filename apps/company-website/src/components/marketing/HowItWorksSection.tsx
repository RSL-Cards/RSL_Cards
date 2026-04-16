'use client'

import { motion } from 'framer-motion'
import { Camera, DollarSign, TrendingUp, Play } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Camera,
    title: 'SCAN',
    description: 'Identify any card instantly',
    details: 'Point your camera or type the player name. We identify the card and pull live eBay comps in under 2 seconds.',
    visual: 'Phone showing scan screen'
  },
  {
    number: '02',
    icon: DollarSign,
    title: 'PRICE',
    description: 'See the deal rating',
    details: 'Good Deal, Fair Price, or Overpaying — calculated instantly from real sold data. Never overpay again.',
    visual: 'GOOD DEAL green badge'
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'PROFIT',
    description: 'Track every dollar',
    details: 'Buy and sell logged automatically. Reports update in real-time. Know your daily, weekly, monthly profit.',
    visual: 'Mini profit chart'
  }
]

export default function HowItWorksSection() {
  return (
    <section className="bg-rsl-black py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-white font-black text-4xl md:text-5xl">
            From scan to profit in 10 seconds
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border transform -translate-y-1/2"></div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-16">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                {/* Step Number */}
                <div className="flex justify-center mb-8">
                  <div className="w-20 h-20 rounded-full border-2 border-rsl-red flex items-center justify-center bg-rsl-black">
                    <span className="text-rsl-red font-black text-2xl">{step.number}</span>
                  </div>
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-white font-bold text-xl mb-2">
                    {step.title}
                  </h3>
                  <p className="text-rsl-red font-semibold mb-3">
                    {step.description}
                  </p>
                  <p className="text-text-secondary leading-relaxed mb-6">
                    {step.details}
                  </p>

                  {/* Visual Mockup */}
                  <div className="bg-surface border border-border rounded-xl p-4 h-32 flex items-center justify-center">
                    <div className="text-text-secondary text-sm text-center">
                      {step.visual}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Demo CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <button className="btn-secondary flex items-center gap-2 mx-auto">
            <Play className="w-5 h-5" />
            See it in action
          </button>
        </motion.div>
      </div>
    </section>
  )
}
