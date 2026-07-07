import { Star } from 'lucide-react'

const testimonials = [
  {
    name: '[Dealer Name]',
    meta: '[City, State]',
    quote:
      "I've been doing shows for 12 years and I've never had a tool like this. I know my profit before I leave the table now.",
  },
  {
    name: '[Dealer Name]',
    meta: '[City, State]',
    quote:
      'The AI told me my Ja Morant rookie was about to move two days before it happened. I listed at the right time.',
  },
  // {
  //   name: '[Collector Name]',
  //   meta: 'Collector',
  //   quote:
  //     'I scanned 30 cards at a show and immediately knew which ones were good deals. This is how collecting should work.',
  // },
  {
    name: '[Dealer Name]',
    meta: '[City, State]',
    quote:
      'The inventory dashboard finally gave us one place to see what we own, what is listed, and what actually made money.',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map((item) => (
          <article key={item.quote} className="border border-line bg-panel p-6">
            <div className="flex gap-1 text-rslRed">
              {[0, 1, 2, 3, 4].map((star) => (
                <Star key={star} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-6 text-xl font-bold leading-8">"{item.quote}"</p>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center bg-rslRed font-black">
                {item.name.slice(1, 2)}
              </div>
              <div>
                <div className="font-black">{item.name}</div>
                <div className="text-sm text-muted">{item.meta}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
