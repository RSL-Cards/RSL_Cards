import { Bot } from 'lucide-react'

export default function AiNarrativeSection() {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-rslRed">AI Narrative Engine</p>
        <h2 className="display-title mt-4 text-3xl leading-tight md:text-5xl">
          Every other tool tells you what happened. RSL Cards tells you why.
        </h2>
        <p className="mt-6 text-lg leading-8 text-neutral-300">
          The RSL Cards AI Narrative Engine monitors player performance, injuries, trades,
          social buzz, and news, then connects them to price movements in your inventory.
        </p>
        <p className="mt-5 text-sm font-bold text-muted">
          Powered by real-time eBay data, ESPN stats feeds, and Claude AI.
        </p>
      </div>
      <div className="border border-white/15 bg-white p-6 text-ink">
        <div className="flex items-center gap-3">
          <Bot className="h-7 w-7 text-rslRed" />
          <span className="text-sm font-black uppercase tracking-[0.18em] text-neutral-500">
            Daily AI Insight
          </span>
        </div>
        <p className="mt-8 text-2xl font-semibold leading-tight">
          "Jayden Daniels rookies are up 18% over the last 48 hours after his 4-TD performance.
          You have 3 cards in your inventory affected. Now may be the time to list."
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {['+18% trend', '3 cards affected', 'List timing'].map((item) => (
            <div key={item} className="border border-neutral-200 bg-neutral-100 p-4 text-sm font-black">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
