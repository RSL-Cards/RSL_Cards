const featureGroups = [
  { id: 'all', title: 'All Features' },
  { id: 'dealers', title: 'Dealers' },
  { id: 'collectors', title: 'Collectors' },
  { id: 'ai-engine', title: 'AI Engine' },
  { id: 'offline', title: 'Offline Mode' },
  { id: 'multi-channel', title: 'Multi-Channel Listing' },
]

export default function FeaturesHero() {
  return (
    <section className="surface-grid relative overflow-hidden border-b border-line pt-28">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(232,0,28,0.24),transparent_58%)]" />
      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-10 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="max-w-4xl">
          <div className="mb-6 inline-flex w-fit items-center gap-2 border border-rslRed/50 bg-rslRed/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-red-100">
            Complete Feature Breakdown
          </div>
          <h1 className="display-title text-4xl leading-tight text-white sm:text-5xl md:text-6xl">
            Everything RSL Cards does across dealers, collectors, AI, offline mode, and listings.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-300">
            Built for comparison shoppers who need to know exactly how RSL Cards differs from
            general collection apps, listing tools, and payment systems.
          </p>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          {featureGroups.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="border border-line bg-panel px-4 py-3 text-sm font-bold text-neutral-200 hover:border-rslRed hover:text-white"
            >
              {group.title}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
