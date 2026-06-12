import StoreButtons from '@/components/shared/StoreButtons'
import PhoneMockup from './PhoneMockup'

export default function HeroSection() {
  return (
    <section className="surface-grid relative overflow-hidden border-b border-line pt-28">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(232,0,28,0.24),transparent_58%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-20">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 border border-rslRed/50 bg-rslRed/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-red-100">
            Run. Sell. Log.
          </div>
          <h1 className="display-title max-w-4xl text-4xl leading-tight text-white sm:text-5xl md:text-6xl">
            The Operating System for Sports Card Dealers
          </h1>
          <p className="mt-6 max-w-2xl text-xl font-semibold leading-tight text-white md:text-2xl">
            Run your card show. Sell across every platform. Finally know your profit.
          </p>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-300">
            RSL Cards Pro puts instant comps, inventory, profit tracking, and multi-channel
            listing in your pocket. Built for dealers who buy and sell at shows and everywhere else.
          </p>
          <div className="mt-8">
            <StoreButtons />
            <p className="mt-4 text-sm font-bold text-muted">Free to start. For iOS and Android.</p>
          </div>
        </div>
        <PhoneMockup />
      </div>
    </section>
  )
}
