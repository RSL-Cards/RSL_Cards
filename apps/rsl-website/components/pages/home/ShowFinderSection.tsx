import { MapPin, ChevronRight, Bell } from 'lucide-react'

export default function ShowFinderSection() {
  return (
    <section className="border-y border-line bg-panel py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div>
          <MapPin className="h-10 w-10 text-rslRed" />
          <h2 className="display-title mt-5 text-3xl leading-tight md:text-5xl">
            Find shows. Find dealers. Find cards.
          </h2>
          <p className="mt-6 text-lg leading-8 text-neutral-300">
            The RSL Cards app includes a card show finder with upcoming shows near you,
            attending dealers, their inventory, and Want List matching.
          </p>
          <a className="mt-8 inline-flex items-center gap-2 bg-white px-5 py-4 font-black text-ink" href="#download">
            Download RSL Cards Free <ChevronRight className="h-5 w-5" />
          </a>
        </div>
        <div className="border border-line bg-ink p-5">
          <div className="border border-line bg-panel2 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black uppercase tracking-[0.18em] text-rslRed">
                Show Finder
              </span>
              <Bell className="h-5 w-5" />
            </div>
            {['Dallas Card Show', 'Nashville Sports Cards', 'Chicago Collectors Expo'].map((show) => (
              <div key={show} className="mt-4 border border-line bg-ink p-4">
                <div className="font-black">{show}</div>
                <div className="mt-1 text-sm text-muted">Want List matches available</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
