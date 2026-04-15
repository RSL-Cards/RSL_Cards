'use client'

import { motion } from 'framer-motion'
import { 
  ShoppingBag, 
  Globe, 
  TrendingUp, 
  Zap, 
  WifiOff, 
  FileText 
} from 'lucide-react'

const features = [
  {
    icon: ShoppingBag,
    title: '10-Second BUY Flow',
    description: 'Scan any card, see live eBay comps, enter price, confirm. Done before the seller changes their mind.',
    color: '#0057FF',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Globe,
    title: 'List Everywhere at Once',
    description: 'Publish to eBay, Whatnot, TCGPlayer, Shopify with one click. Prices sync. Sold on one? Auto-removed from all.',
    color: '#7B2FFF',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Market Comps',
    description: 'Live eBay sold data for every card. Know if you\'re getting a good deal before you commit.',
    color: '#00C853',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Zap,
    title: 'AI Market Intelligence',
    description: 'Our AI explains WHY card prices move. Get insights on your inventory before the market moves.',
    color: '#FFB300',
    bgColor: 'bg-amber-500/10',
  },
  {
    icon: WifiOff,
    title: 'Works Without WiFi',
    description: 'Card shows have terrible signal. RSL Cards works fully offline and syncs when you reconnect.',
    color: '#E8001C',
    bgColor: 'bg-red-500/10',
  },
  {
    icon: FileText,
    title: 'Tax-Ready Reports',
    description: 'Profit/loss by card, channel, and period. Export Schedule C data. Stop dreading tax season.',
    color: '#00BCD4',
    bgColor: 'bg-teal-500/10',
  },
]

export default function FeaturesSection() {
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
          <div className="inline-flex items-center border border-red-200 bg-red-50 text-red-600 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            Features
          </div>
          <h2 className="text-black font-black text-4xl md:text-5xl mb-4">
            Everything a dealer needs
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Built by dealers, for dealers. Every feature designed for the card show floor.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              {/* Icon */}
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
                style={{ backgroundColor: feature.color + '20' }}
              >
                <feature.icon 
                  className="w-8 h-8"
                  style={{ color: feature.color }}
                />
              </div>

              {/* Content */}
              <h3 className="text-black font-bold text-xl mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
