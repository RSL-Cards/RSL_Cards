import { Check, Bot } from 'lucide-react'

export default function FeaturesAi() {
  return (
    <section className="border-b border-line bg-white py-20 text-ink">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <Bot className="h-10 w-10 text-rslRed" />
          <h2 className="display-title mt-5 text-3xl leading-tight md:text-5xl">
            AI context is built into the workflow, not bolted on later.
          </h2>
          <p className="mt-6 text-lg leading-8 text-neutral-700">
            Dealers get plain-English explanations that connect sold comps to player news, market
            movement, timing, and inventory impact.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {['Trend explanations', 'Daily market movers', 'Inventory impact', 'Price alert context'].map((item) => (
            <div key={item} className="flex items-center gap-3 border border-neutral-200 bg-neutral-100 p-5 font-bold">
              <Check className="h-5 w-5 text-rslRed" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
