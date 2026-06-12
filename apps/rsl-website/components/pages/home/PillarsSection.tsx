import { ScanLine, ShoppingBag, BarChart3 } from 'lucide-react'

const pillars = [
  {
    label: 'RUN',
    icon: ScanLine,
    title: 'Instant comps at the table',
    text: 'Scan any card with your camera. Get recent eBay sold prices, a 90-day trend chart, and a deal rating in under 2 seconds.',
  },
  {
    label: 'SELL',
    icon: ShoppingBag,
    title: 'Multi-channel listing from one place',
    text: 'List cards on eBay, Whatnot, Mercari, TCGPlayer, Shopify, and more from your dashboard. See fees and net profit before you post.',
  },
  {
    label: 'LOG',
    icon: BarChart3,
    title: 'Know your profit at every moment',
    text: 'Every buy and sell is automatically logged. See daily profit, weekly reports, monthly reports, and exports for taxes.',
  },
]

export default function PillarsSection() {
  return (
    <section className="border-y border-line bg-panel py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-rslRed">Meet RSL Cards Pro</p>
          <h2 className="display-title mt-4 text-3xl leading-tight md:text-5xl">
            Run the comps. Sell the card. Log the sale.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <article key={pillar.label} className="border border-line bg-ink p-6">
                <div className="flex items-center justify-between">
                  <span className="bg-rslRed px-3 py-1 text-xs font-black tracking-[0.18em]">{pillar.label}</span>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-8 text-xl font-bold md:text-2xl">{pillar.title}</h3>
                <p className="mt-4 leading-7 text-neutral-300">{pillar.text}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
