import { ArrowRight } from 'lucide-react'

const workflow = [
  {
    title: 'Scan',
    text: 'Point your camera at any card. Ximilar AI identifies it fast, or scan the barcode on graded slabs.',
  },
  {
    title: 'Check Comps',
    text: 'See recent eBay sold prices, average value, trend direction, and an AI explanation.',
  },
  {
    title: 'Buy or Sell',
    text: 'Tap BUY or SELL, enter the price, generate a payment QR code, and confirm the deal.',
  },
  {
    title: 'List & Profit',
    text: 'Inventory updates with cost basis while your desktop dashboard handles listings and profit.',
  },
]

export default function WorkflowSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-rslRed">Dealer workflow</p>
          <h2 className="display-title mt-4 text-3xl leading-tight md:text-5xl">
            From card show table to sold listing in seconds.
          </h2>
        </div>
        <a className="inline-flex w-fit items-center gap-2 bg-rslRed px-5 py-4 font-black" href="#download">
          Start Free <ArrowRight className="h-5 w-5" />
        </a>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-4">
        {workflow.map((step, index) => (
          <article key={step.title} className="border border-line bg-panel p-5">
            <div className="text-4xl font-semibold text-rslRed">{index + 1}</div>
            <h3 className="mt-6 text-xl font-bold md:text-2xl">{step.title}</h3>
            <p className="mt-3 leading-7 text-neutral-300">{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
