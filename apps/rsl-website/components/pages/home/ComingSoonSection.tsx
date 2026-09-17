import PhoneMockup from './PhoneMockup'

export default function ComingSoonSection() {
  return (
    <section id="coming-soon" className="surface-grid relative overflow-hidden border-b border-line pt-24 sm:pt-28 lg:pt-20">
      <div className="absolute inset-y-0 right-0 w-[50%] bg-[radial-gradient(circle_at_center,rgba(232,0,28,0.24),transparent_58%)] lg:right-[5%]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 sm:gap-12 px-5 pb-12 sm:pb-16 pt-4 sm:pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-20">
        <div className="flex flex-col justify-center text-left">
          <div className="mb-4 inline-flex w-fit items-center gap-2 border border-rslRed/50 bg-rslRed/10 px-3.5 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-red-200">
            Sports Cards · TCG · Dealer Commerce
          </div>
          <h1 className="display-title max-w-4xl text-3xl sm:text-5xl md:text-6xl leading-[1.12] text-white">
            The Operating System for Card Dealers
          </h1>
          <p className="mt-4 sm:mt-6 max-w-2xl text-base sm:text-xl md:text-2xl font-semibold leading-relaxed sm:leading-tight text-neutral-200">
            TCG cards, sports cards, show-floor sales, and dealer-to-dealer transactions. RSL Cards unifies your inventory, live comps, cash + trade deals, and profit accounting in one connected platform.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <a
              href="https://app.rslcards.com/login"
              className="inline-flex w-full sm:w-auto items-center justify-center bg-rslRed px-8 py-4 text-base font-black transition text-white hover:bg-white hover:!text-black text-center"
            >
              Join Early Access
            </a>
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 text-center sm:text-left">
              ⚡ Zero WiFi Required on Show Floor
            </span>
          </div>
        </div>
        <div className="flex justify-center w-full overflow-hidden py-2">
          <PhoneMockup />
        </div>
      </div>
      
      {/* Integration & Capability Badges */}
      <div className="border-t border-line bg-white text-ink">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center sm:justify-between gap-3 sm:gap-6 px-5 py-4 sm:py-5 text-[11px] sm:text-sm font-black uppercase tracking-[0.12em] lg:px-8 text-center">
          <span className="opacity-70">Sports Cards &amp; TCG</span>
          <span className="opacity-70">Dealer-to-Dealer Trades</span>
          <span className="opacity-70">Live Sold Comps</span>
          <span className="opacity-70">Offline Show Floor Mode</span>
          <span className="opacity-70">PSA · BGS · CGC Sync</span>
        </div>
      </div>
    </section>
  )
}
