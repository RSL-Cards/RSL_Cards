'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="w-full bg-rsl-red py-16">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-white font-black text-3xl md:text-4xl mb-6">
            Ready to run your card business like a pro?
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <button className="bg-white text-rsl-red font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2">
              Start Free Today — No Credit Card Required
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-white/80 text-lg">
            Join 12,000+ dealers. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
