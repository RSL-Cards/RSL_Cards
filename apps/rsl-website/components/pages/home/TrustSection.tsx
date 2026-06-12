import { ShieldCheck } from 'lucide-react'

const trustItems = [
  'Built for 8,000+ card show dealers across the US',
  '2,000-3,000 card shows annually',
  'Built for the show floor',
]

export default function TrustSection() {
  return (
    <section className="border-b border-line bg-white text-ink">
      <div className="mx-auto grid max-w-7xl gap-4 px-5 py-5 text-sm font-black uppercase tracking-[0.1em] md:grid-cols-3 lg:px-8">
        {trustItems.map((item) => (
          <div key={item} className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-rslRed" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
