import { Check } from 'lucide-react'

export default function AboutHero() {
  return (
    <section className="surface-grid border-b border-line pt-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-rslRed">About RSL Cards</p>
          <h1 className="display-title mt-4 text-4xl leading-tight sm:text-5xl md:text-6xl">
            Built by dealers. Built for dealers.
          </h1>
          <p className="mt-6 text-lg leading-8 text-neutral-300">
            RSL Cards was born at a card show. Dealers were negotiating from memory, accepting
            payments they would never log, and leaving with no clear view of profit.
          </p>
          <p className="mt-5 text-lg leading-8 text-neutral-300">
            RSL stands for Reddy Sherrer Lane: Run the comps. Sell the card. Log the sale.
          </p>
        </div>
        <div className="border border-line bg-panel p-6">
          <h2 className="text-2xl font-bold">Mission</h2>
          <p className="mt-4 leading-8 text-neutral-300">
            To give every sports card dealer, from the first-timer at a local show to the full-time
            professional, the operating system their business deserves.
          </p>
          <div className="mt-8 grid gap-4">
            {['Reddy Sherrer Lane LLC', 'rslcards.com', 'Launched 2026'].map((item) => (
              <div key={item} className="flex items-center gap-3 border border-line bg-ink p-4 font-bold">
                <Check className="h-5 w-5 text-rslRed" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
