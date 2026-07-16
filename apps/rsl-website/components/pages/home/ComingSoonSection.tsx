import PhoneMockup from './PhoneMockup'

export default function ComingSoonSection() {
  return (
    <section id="coming-soon" className="surface-grid relative overflow-hidden border-b border-line pt-20">
      <div className="absolute inset-y-0 right-0 w-[50%] bg-[radial-gradient(circle_at_center,rgba(232,0,28,0.24),transparent_58%)] lg:right-[5%]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-20">
        <div className="flex flex-col justify-center">
          <h1 className="display-title max-w-4xl text-4xl leading-tight text-white sm:text-5xl md:text-6xl">
            Run Smarter Sports Card Business Operations
          </h1>
          <p className="mt-6 max-w-2xl text-xl font-semibold leading-tight text-white md:text-2xl">
            RSL Cards combines inventory, pricing context, player insights, sales activity, and profitability tools in one platform.
          </p>
          <div className="mt-8">
            <a
              href="#early-access"
              className="inline-flex items-center justify-center bg-rslRed px-8 py-4 text-base font-black transition text-white hover:bg-white hover:!text-black"
            >
              Join Early Access
            </a>
          </div>
        </div>
        <PhoneMockup />
      </div>
      
      {/* Integration Logos */}
      <div className="border-t border-line bg-white text-ink">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 text-sm font-black uppercase tracking-[0.1em] lg:px-8">
          <span className="opacity-50">PSA Data Integration</span>
          <span className="opacity-50">Marketplace Sync</span>
          <span className="opacity-50">Verified Comps</span>
        </div>
      </div>
    </section>
  )
}
