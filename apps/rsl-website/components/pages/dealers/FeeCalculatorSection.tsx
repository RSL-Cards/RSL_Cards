import { Calculator, ArrowRight } from 'lucide-react'

const platforms = [
  { name: 'eBay', fees: 'High reach', note: 'Best for broad buyer demand and sold comp visibility' },
  { name: 'Whatnot', fees: 'Live selling', note: 'Best for fast auction sessions and audience-driven volume' },
  { name: 'Mercari', fees: 'Marketplace', note: 'Best for simple fixed-price listings' },
  { name: 'TCGPlayer', fees: 'Category depth', note: 'Best for trading card game inventory' },
  { name: 'Shopify', fees: 'Owned store', note: 'Best for repeat customers and brand control' },
  { name: 'Facebook', fees: 'Community', note: 'Best for local and group-based sales' },
]

export default function FeeCalculatorSection() {
  return (
    <section className="border-y border-line bg-panel py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <Calculator className="h-10 w-10 text-rslRed" />
          <h2 className="display-title mt-5 text-3xl leading-tight md:text-5xl">
            See instantly where you make the most money.
          </h2>
          <p className="mt-6 text-lg leading-8 text-neutral-300">
            The fee calculator in RSL Cards Pro helps dealers compare platforms before listing.
            This view is built to make platform economics clear instead of hiding them.
          </p>
          <a className="mt-8 inline-flex items-center gap-2 bg-rslRed px-5 py-4 font-black" href="#download">
            Try the dealer app <ArrowRight className="h-5 w-5" />
          </a>
        </div>
        <div className="overflow-hidden border border-line bg-ink">
          <div className="grid grid-cols-[0.8fr_0.8fr_1.4fr] border-b border-line bg-black px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-muted">
            <span>Platform</span>
            <span>Best for</span>
            <span>Dealer note</span>
          </div>
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="grid grid-cols-[0.8fr_0.8fr_1.4fr] border-b border-line px-4 py-4 last:border-b-0"
            >
              <span className="font-bold text-white">{platform.name}</span>
              <span className="text-neutral-300">{platform.fees}</span>
              <span className="text-neutral-400">{platform.note}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
