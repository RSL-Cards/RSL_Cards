import { ShieldCheck } from 'lucide-react'

export default function AuthBrandPanel() {
  return (
    <section className="hidden bg-gray-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
      <div>
        <div className="inline-flex items-center gap-3">
          <img 
            src={process.env.NEXT_PUBLIC_LOGO_URL || "/rslicon.jpeg"} 
            alt="RSL Cards Logo" 
            className="h-12 w-12 rounded-xl bg-white object-contain p-1 shadow-sm ring-1 ring-white/20"
          />
          <span className="font-bold text-white tracking-tight text-xl">RSL Cards</span>
        </div>

        <div className="mt-14 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight">
            Dealer operations, without the clutter.
          </h1>
          <p className="mt-4 text-base leading-7 text-gray-300">
            Manage inventory, listings, transactions, reports, and RSL insights
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
