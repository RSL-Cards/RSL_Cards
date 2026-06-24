import { MapPin, ChevronRight, Bell } from 'lucide-react'

export default function ShowFinderSection() {
  return (
    <section className="border-y border-line bg-panel py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div>
          <MapPin className="h-10 w-10 text-rslRed" />
          <h2 className="display-title mt-5 text-3xl leading-tight md:text-5xl">
            Prep shows. Track inventory. Sell faster.
          </h2>
          <p className="mt-6 text-lg leading-8 text-neutral-300">
            Use the RSL Cards dealer workflow to prepare inventory before a show, record table
            buys and sales during the event, and sync everything back to the web dashboard.
          </p>
        </div>
        <div className="border border-line bg-ink p-5">
          <div className="border border-line bg-panel2 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black uppercase tracking-[0.18em] text-rslRed">
                Show Inventory
              </span>
              <Bell className="h-5 w-5" />
            </div>
            {['Dallas Card Show', 'Nashville Sports Cards', 'Chicago Sports Card Show'].map((show) => (
              <div key={show} className="mt-4 border border-line bg-ink p-4">
                <div className="font-black">{show}</div>
                <div className="mt-1 text-sm text-muted">Inventory and sales plan ready</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
