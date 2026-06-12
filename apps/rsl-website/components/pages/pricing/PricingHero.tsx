import { Check } from 'lucide-react'

const plans = [
  {
    name: 'RSL Cards',
    price: 'Free',
    audience: 'Collector App',
    features: ['Card scanning', 'Collection tracker', 'Price alerts', 'Card show finder', 'Market movers feed'],
  },
  {
    name: 'RSL Cards Pro Starter',
    price: 'Free',
    audience: 'Dealers',
    features: ['BUY/SELL flow', 'Starter transactions', 'Basic inventory', 'Offline mode', 'QR payment codes'],
  },
  {
    name: 'RSL Cards Pro',
    price: '$[X]/mo',
    audience: 'Power Dealers',
    features: ['Unlimited transactions', 'Multi-channel listing', 'AI Narrative Engine', 'Tax reporting', 'Customer database'],
  },
  {
    name: 'Enterprise',
    price: '$[X]/mo',
    audience: 'Teams',
    features: ['Team access', 'Dedicated onboarding', 'Priority support', 'Custom integrations'],
  },
]

export default function PricingHero() {
  return (
    <section className="surface-grid border-b border-line pt-28">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-rslRed">Pricing</p>
          <h1 className="display-title mt-4 text-4xl leading-tight sm:text-5xl md:text-6xl">
            Simple pricing. No surprises.
          </h1>
          <p className="mt-6 text-lg leading-8 text-neutral-300">
            RSL Cards is free for collectors. RSL Cards Pro has a free dealer tier with paid plans
            for more power.
          </p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-4">
          {plans.map((plan) => (
            <article key={plan.name} className="border border-line bg-panel p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rslRed">{plan.audience}</p>
              <h2 className="mt-4 text-2xl font-bold">{plan.name}</h2>
              <div className="mt-4 text-4xl font-semibold">{plan.price}</div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm text-neutral-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-rslRed" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
