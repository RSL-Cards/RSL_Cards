import { LineChart } from 'lucide-react'

const marketCards = [
  { card: 'Jayden Daniels Rookie', move: '+18%', reason: '4-TD game drove new buyer demand' },
  { card: 'Victor Wembanyama Silver', move: '+11%', reason: 'Recent sales tightened across graded copies' },
  { card: 'Shohei Ohtani Chrome', move: '+9%', reason: 'News cycle and search volume both climbed' },
]

export default function MarketMoversSection() {
  return (
    <section className="border-y border-line bg-panel py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <LineChart className="h-10 w-10 text-rslRed" />
          <h2 className="display-title mt-5 text-3xl leading-tight md:text-5xl">
            See the market move before you make your next buy.
          </h2>
          <p className="mt-6 text-lg leading-8 text-neutral-300">
            RSL Cards explains price moves with context, so collectors can tell the difference
            between a real trend and noise.
          </p>
        </div>
        <div className="grid gap-4">
          {marketCards.map((item) => (
            <article key={item.card} className="border border-line bg-ink p-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-bold">{item.card}</h3>
                <span className="bg-green-500/15 px-3 py-1 font-bold text-green-300">{item.move}</span>
              </div>
              <p className="mt-3 text-neutral-300">{item.reason}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
