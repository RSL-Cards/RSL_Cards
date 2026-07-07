import { WifiOff, CloudOff } from 'lucide-react'

const offlineFeatures = [
  'Text search',
  'Barcode scan for graded cards',
  'Cached comp data',
  'QR payment codes',
  'Reports',
  'Auto-sync when signal returns',
]

export default function OfflineSection() {
  return (
    <section className="border-y border-line bg-white py-20 text-ink">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <WifiOff className="h-10 w-10 text-rslRed" />
          <h2 className="display-title mt-5 text-3xl leading-tight md:text-5xl">
            No signal? No problem.
          </h2>
          <p className="mt-6 text-lg leading-8 text-neutral-700">
            Card shows have terrible WiFi. RSL Cards Pro works offline with a cached card database,
            offline comps from the last 30 days, and local transactions that sync when you reconnect.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {offlineFeatures.map((feature) => (
            <div key={feature} className="flex items-center gap-3 border border-neutral-200 bg-neutral-100 p-5 font-black">
              <CloudOff className="h-5 w-5 text-rslRed" />
              {feature}: offline
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
