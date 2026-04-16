'use client'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

const plans = [
  {
    name: 'FREE',
    price: '$0/month',
    badge: 'For Beginners',
    highlighted: false,
    features: [
      { text: '50 inventory items', included: true },
      { text: 'Basic BUY/SELL flow', included: true },
      { text: 'Manual comps (text search)', included: true },
      { text: 'Basic reports (30 days)', included: true },
      { text: 'Camera scanning', included: false },
      { text: 'Multi-channel listing', included: false },
      { text: 'AI narratives', included: false },
    ],
    buttonText: 'Start Free',
    buttonStyle: 'btn-outline'
  },
  {
    name: 'PRO',
    price: '$29/month',
    yearlyPrice: '$290/year (save 2 months)',
    badge: 'MOST POPULAR',
    highlighted: true,
    features: [
      { text: 'Unlimited inventory', included: true },
      { text: 'Camera + barcode scanning', included: true },
      { text: 'Live eBay comps', included: true },
      { text: 'Multi-channel listing (all platforms)', included: true },
      { text: 'AI narratives + insights', included: true },
      { text: 'Full reports + tax export', included: true },
      { text: 'Offline mode', included: true },
      { text: 'Customer CRM', included: true },
    ],
    buttonText: 'Start Pro Free',
    buttonStyle: 'btn-primary'
  },
  {
    name: 'ENTERPRISE',
    price: 'Custom',
    badge: 'For Teams',
    highlighted: false,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Team accounts (up to 10 dealers)', included: true },
      { text: 'Shared inventory pool', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'API access', included: true },
    ],
    buttonText: 'Contact Sales',
    buttonStyle: 'btn-outline'
  }
]

export default function PricingSection() {
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
          <h2 className="text-white font-black text-4xl md:text-5xl mb-4">
            Simple, honest pricing
          </h2>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-surface border rounded-2xl p-8 ${
                plan.highlighted 
                  ? 'border-rsl-red' 
                  : 'border-border'
              }`}
            >
              {/* Popular Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-rsl-red text-white text-xs px-4 py-1 rounded-full font-bold">
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-white font-bold text-2xl mb-2 text-center">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="text-white font-mono text-3xl font-black mb-2">
                  {plan.price}
                </div>
                {plan.yearlyPrice && (
                  <div className="text-text-secondary text-sm">
                    {plan.yearlyPrice}
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-success flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-text-muted flex-shrink-0" />
                    )}
                    <span className={`text-sm ${
                      feature.included ? 'text-white' : 'text-text-muted'
                    }`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Button */}
              <button className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                plan.buttonStyle === 'btn-primary' 
                  ? 'bg-rsl-red text-white hover:bg-red-600' 
                  : 'border border-white/20 text-white hover:border-white/60'
              }`}>
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 bg-success/10 border border-success/20 rounded-full px-4 py-2 text-sm font-medium text-success">
            <Check className="w-4 h-4" />
            30-day money-back guarantee
          </div>
        </motion.div>
      </div>
    </section>
  )
}
