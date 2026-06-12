import { Check } from 'lucide-react'

export default function CollectorTrust() {
  return (
    <section className="border-b border-line bg-white text-ink">
      <div className="mx-auto grid max-w-7xl gap-4 px-5 py-5 md:grid-cols-3 lg:px-8">
        {['28 million US collectors', 'AI explanations with comps', 'Shows, dealers, and want lists'].map((item) => (
          <div key={item} className="flex items-center gap-3 font-bold">
            <Check className="h-5 w-5 text-rslRed" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
