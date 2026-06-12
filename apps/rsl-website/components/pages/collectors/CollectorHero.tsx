import StoreButtons from '@/components/shared/StoreButtons'
import CollectorMockup from './CollectorMockup'

export default function CollectorHero() {
  return (
    <section className="surface-grid relative overflow-hidden border-b border-line pt-28">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(232,0,28,0.24),transparent_58%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-20">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 border border-rslRed/50 bg-rslRed/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-red-100">
            Free for Collectors
          </div>
          <h1 className="display-title max-w-4xl text-4xl leading-tight text-white sm:text-5xl md:text-6xl">
            Finally understand why your cards are worth what they&apos;re worth.
          </h1>
          <p className="mt-6 max-w-2xl text-xl font-semibold leading-tight text-white md:text-2xl">
            RSL Cards gives collectors real comps, AI-powered market intelligence, and a card show map in one place.
          </p>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-300">
            Scan at shows, track your collection, set smart alerts, and follow the daily market
            movements that matter to the cards you already own or want next.
          </p>
          <div className="mt-8">
            <StoreButtons />
          </div>
        </div>
        <CollectorMockup />
      </div>
    </section>
  )
}
