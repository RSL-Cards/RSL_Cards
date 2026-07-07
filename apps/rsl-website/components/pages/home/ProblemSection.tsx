import { Search, CircleDollarSign, Database } from 'lucide-react'

const painPoints = [
  {
    icon: Search,
    title: 'No comps at the table',
    text: "You're negotiating blind against buyers who looked it up.",
  },
  {
    icon: CircleDollarSign,
    title: 'No profit tracking',
    text: "You know you sold cards. You don't know if you made money.",
  },
  {
    icon: Database,
    title: 'No inventory system',
    text: "You have no idea what you own, what it's worth, or what's aging.",
  },
]

export default function ProblemSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8" id="features">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-rslRed">The problem</p>
          <h2 className="display-title mt-4 text-3xl leading-tight md:text-5xl">
            Card dealers run million-dollar businesses on napkins.
          </h2>
          <p className="mt-6 text-lg leading-8 text-neutral-300">
            You negotiate verbally. You accept cash and Venmo and try to remember what you paid.
            You leave shows not knowing if you made money. No software was ever built for how card
            show dealers actually work. Until now.
          </p>
        </div>
        <div className="grid gap-4">
          {painPoints.map((item) => {
            const Icon = item.icon
            return (
              <article key={item.title} className="border border-line bg-panel p-6">
                <Icon className="h-7 w-7 text-rslRed" />
                <h3 className="mt-5 text-xl font-bold md:text-2xl">{item.title}</h3>
                <p className="mt-2 text-neutral-300">{item.text}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
