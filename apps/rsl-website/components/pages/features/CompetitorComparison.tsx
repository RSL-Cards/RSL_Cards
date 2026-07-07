import { Check, Minus, X } from 'lucide-react'

const comparisonRows = [
  { feature: 'Mobile BUY/SELL flow', rsl: 'Yes', dealerPro: 'No', collx: 'No' },
  { feature: 'Works at card shows', rsl: 'Yes', dealerPro: 'No', collx: 'No' },
  { feature: 'Offline mode', rsl: 'Yes', dealerPro: 'No', collx: 'No' },
  { feature: 'Multi-channel listing', rsl: 'Yes', dealerPro: 'Partial', collx: 'No' },
  { feature: 'AI price explanations', rsl: 'Yes', dealerPro: 'No', collx: 'No' },
  { feature: 'Consumer marketplace', rsl: 'Yes', dealerPro: 'No', collx: 'Yes' },
  { feature: 'Tax reporting', rsl: 'Yes', dealerPro: 'No', collx: 'No' },
]

function ValueIcon({ value }: { value: string }) {
  if (value === 'Yes') {
    return (
      <span className="inline-flex items-center gap-2 font-bold text-green-300">
        <Check className="h-4 w-4" />
        Yes
      </span>
    )
  }

  if (value === 'Partial') {
    return (
      <span className="inline-flex items-center gap-2 font-bold text-yellow-300">
        <Minus className="h-4 w-4" />
        Partial
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-2 text-neutral-400">
      <X className="h-4 w-4" />
      No
    </span>
  )
}

export default function CompetitorComparison() {
  return (
    <section className="border-y border-line bg-panel py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-rslRed">Competitor comparison</p>
          <h2 className="display-title mt-4 text-3xl leading-tight md:text-5xl">
            No one else built this for card dealers.
          </h2>
          <p className="mt-5 text-lg leading-8 text-neutral-300">
            RSL Cards Pro combines mobile dealer workflows, offline show-floor tools, AI price
            explanations, and business reporting in one ecosystem.
          </p>
        </div>

        <div className="mt-12 overflow-x-auto border border-line bg-ink">
          <table className="min-w-[760px] w-full border-collapse text-left">
            <thead className="bg-black text-sm uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="border-b border-line p-4">Feature</th>
                <th className="border-b border-line p-4 text-white">RSL Cards Pro</th>
                <th className="border-b border-line p-4">Card Dealer Pro</th>
                <th className="border-b border-line p-4">CollX</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.feature} className="border-b border-line last:border-b-0">
                  <td className="p-4 font-bold">{row.feature}</td>
                  <td className="bg-rslRed/10 p-4">
                    <ValueIcon value={row.rsl} />
                  </td>
                  <td className="p-4">
                    <ValueIcon value={row.dealerPro} />
                  </td>
                  <td className="p-4">
                    <ValueIcon value={row.collx} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
