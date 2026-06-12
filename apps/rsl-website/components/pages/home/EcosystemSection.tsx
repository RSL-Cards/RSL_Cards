import { Check } from 'lucide-react'
import StoreButtons from '@/components/shared/StoreButtons'

const appCards = [
  {
    id: 'dealers',
    name: 'RSL Cards Pro',
    audience: 'For Dealers',
    accent: 'bg-rslRed',
    features: [
      'BUY flow: scan, comp, price, pay in 8-10 seconds',
      'SELL flow: select inventory, price, generate QR payment code',
      'Offline mode for shows with no signal',
      'Multi-channel listing from the web dashboard',
      'Reports, tax tools, and customer database',
    ],
  },
  {
    id: 'collectors',
    name: 'RSL Cards',
    audience: 'For Collectors',
    accent: 'bg-white text-ink',
    features: [
      'Scan any card for instant price and AI explanation',
      'Track your collection with portfolio value',
      'Set price alerts with AI context',
      'Find upcoming card shows near you',
      'See daily Market Movers explained by AI',
    ],
  },
]

export default function EcosystemSection() {
  return (
    <section className="border-y border-line bg-panel py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-rslRed">One ecosystem</p>
          <h2 className="display-title mt-4 text-3xl leading-tight md:text-5xl">
            Two apps. One ecosystem.
          </h2>
          <p className="mt-6 text-lg leading-8 text-neutral-300">
            RSL Cards Pro is built for dealers. RSL Cards is built for collectors. Both share
            real-time data, AI intelligence, and the same card database.
          </p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {appCards.map((app) => (
            <article id={app.id} key={app.name} className="border border-line bg-ink p-6">
              <span className={`inline-flex px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${app.accent}`}>
                {app.audience}
              </span>
              <h3 className="mt-6 text-3xl font-bold">{app.name}</h3>
              <ul className="mt-6 space-y-4">
                {app.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-neutral-300">
                    <Check className="mt-1 h-5 w-5 shrink-0 text-rslRed" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <StoreButtons />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
