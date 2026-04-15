'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const stats = [
  { value: '$2.4B+', label: 'in card transactions tracked' },
  { value: '12,000+', label: 'active dealers' },
  { value: '50+', label: 'card show markets' },
  { value: '4.9/5', label: 'dealer satisfaction rating' },
]

export default function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section className="w-full bg-[#0D0D0D] border-y border-[#252525] py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              ref={ref}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-white font-mono text-5xl md:text-6xl font-black mb-2">
                {stat.value}
              </div>
              <div className="h-1 w-10 bg-rsl-red mx-auto mb-3"></div>
              <div className="text-text-secondary text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
