const heroStats = [
  { value: '8-10 sec', label: 'BUY flow from scan to logged deal' },
  { value: '5+', label: 'selling channels from one dashboard' },
  { value: '0 signal', label: 'required for show-floor workflows' },
]

export default function DealerStats() {
  return (
    <section className="border-b border-line bg-white text-ink">
      <div className="mx-auto grid max-w-7xl gap-4 px-5 py-5 md:grid-cols-3 lg:px-8">
        {heroStats.map((stat) => (
          <div key={stat.label} className="border-l-4 border-rslRed pl-4">
            <div className="text-2xl font-semibold">{stat.value}</div>
            <div className="text-sm font-bold uppercase tracking-[0.12em] text-neutral-600">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
