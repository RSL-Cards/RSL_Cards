import { ShieldCheck } from 'lucide-react'

export default function AuthBrandPanel() {
  return (
    <section className="hidden bg-gray-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
      <div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2">
          <span className="font-black italic tracking-tight">RSL</span>
          <span className="text-xs font-bold tracking-[0.2em] text-red-400">
            CARDS
          </span>
        </div>

        <div className="mt-14 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight">
            Dealer operations, without the clutter.
          </h1>
          <p className="mt-4 text-base leading-7 text-gray-300">
            Manage inventory, listings, transactions, reports, and AI insights
            from a single dashboard.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {['Inventory', 'Listings', 'Reports'].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-white/10 bg-white/10 p-4"
          >
            <ShieldCheck className="mb-4 h-5 w-5 text-blue-300" />
            <p className="text-sm font-semibold">{item}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
