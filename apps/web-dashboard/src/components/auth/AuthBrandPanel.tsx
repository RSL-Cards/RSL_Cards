import { ShieldCheck } from 'lucide-react'

export default function AuthBrandPanel() {
  return (
    <section className="hidden bg-[#000000] p-10 text-white lg:flex lg:flex-col lg:justify-between border-r border-[#252525]">
      <div>
        <div className="inline-flex items-center gap-3">
          <img 
            src={process.env.NEXT_PUBLIC_LOGO_URL || "/rslicon.jpeg"} 
            alt="RSL Cards Logo" 
            className="h-12 w-12 rounded-xl bg-[#141414] object-contain p-1 shadow-sm ring-1 ring-[#252525]"
          />
          <span className="font-bold text-white tracking-tight text-xl">RSL Cards</span>
        </div>

        <div className="mt-14 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Dealer operations, without the clutter.
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-400">
            Manage inventory, listings, transactions, reports, and RSL insights
            from a single dashboard.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {['Inventory', 'Listings', 'Reports'].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-[#252525] bg-[#0D0D0D] p-4"
          >
            <ShieldCheck className="mb-4 h-5 w-5 text-[#E8001C]" />
            <p className="text-sm font-semibold text-white">{item}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
