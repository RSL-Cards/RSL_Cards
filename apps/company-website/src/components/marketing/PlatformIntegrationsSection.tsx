'use client'

import { motion } from 'framer-motion'

const platformsRow1 = [
  'eBay', 'Whatnot', 'TCGPlayer', 'Shopify', 'COMC', 'Mercari', 'Facebook', 'Goldin'
]

const platformsRow2 = [
  'MySlabs', 'Instagram Shop', 'PSA', 'BGS', 'SGC', 'Sportradar', 'Ximilar', 'Claude AI'
]

export default function PlatformIntegrationsSection() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-black font-black text-4xl md:text-5xl mb-4">
            Sell everywhere from one place
          </h2>
        </motion.div>

        {/* Logo Marquee */}
        <div className="relative overflow-hidden mb-16">
          {/* Row 1 - Left to Right */}
          <div className="flex animate-marquee">
            {[...platformsRow1, ...platformsRow1].map((platform, index) => (
              <div
                key={`row1-${index}`}
                className="flex-shrink-0 mx-8"
              >
                <div className="bg-gray-100 border border-gray-200 rounded-lg px-6 py-3 min-w-[80px] text-center">
                  <span className="text-gray-600 font-medium text-sm">{platform}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2 - Right to Left */}
          <div className="flex animate-marquee-reverse mt-4">
            {[...platformsRow2, ...platformsRow2].map((platform, index) => (
              <div
                key={`row2-${index}`}
                className="flex-shrink-0 mx-8"
              >
                <div className="bg-gray-100 border border-gray-200 rounded-lg px-6 py-3 min-w-[80px] text-center">
                  <span className="text-gray-600 font-medium text-sm">{platform}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sub-banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-rsl-black rounded-2xl p-8 text-center"
        >
          <p className="text-white text-lg">
            When a card sells on any platform, we automatically remove it from all others. 
            <span className="text-rsl-red font-bold"> Zero double-sells.</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
