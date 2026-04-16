'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    content: "RSL Cards paid for itself on the first day I used it at a show. I used to eyeball comps on eBay while negotiating. Now I just tap scan and I know exactly what to pay.",
    author: "Mike Rodriguez",
    title: "Card show dealer, Dallas TX · 8 years",
    stats: "Avg 3 shows/month · $12k/month volume",
    initials: "MR"
  },
  {
    id: 2,
    content: "The multi-channel listing alone saves me 4 hours a week. List on eBay, Whatnot, and TCGPlayer simultaneously. When something sells, everything else closes automatically.",
    author: "Sarah Chen",
    title: "Online seller · eBay PowerSeller",
    stats: "247 active listings · $8k/month",
    initials: "SC"
  },
  {
    id: 3,
    content: "Finally, a tax report that doesn't make me cry. All my profit/loss organized by card, platform, and period. My accountant loves it.",
    author: "Dave Wilson",
    title: "Part-time dealer, Chicago IL",
    stats: "Weekend shows · $3k/month side income",
    initials: "DW"
  }
]

export default function TestimonialsSection() {
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
          <h2 className="text-black font-black text-4xl md:text-5xl">
            What dealers are saying
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 leading-relaxed mb-6">
                &quot;{testimonial.content}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-semibold text-sm">
                    {testimonial.initials}
                  </span>
                </div>
                <div>
                  <div className="text-black font-semibold">
                    {testimonial.author}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {testimonial.title}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    {testimonial.stats}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
