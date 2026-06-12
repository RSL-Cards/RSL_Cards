import { CloudOff, Check } from 'lucide-react'

export default function DealerOffline() {
  return (
    <section className="border-b border-line bg-white py-20 text-ink">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <CloudOff className="h-10 w-10 text-rslRed" />
          <h2 className="display-title mt-5 text-3xl leading-tight md:text-5xl">
            Built for bad WiFi, packed aisles, and buyers waiting.
          </h2>
          <p className="mt-6 text-lg leading-8 text-neutral-700">
            Dealers cannot pause a transaction because the venue signal disappeared. RSL Cards Pro
            keeps core workflows available offline and syncs the record when the connection returns.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            'Offline text search',
            'Barcode scan for graded cards',
            'Cached comp data',
            'QR payment codes',
            'Local reports',
            'Automatic sync',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 border border-neutral-200 bg-neutral-100 p-5 font-bold">
              <Check className="h-5 w-5 text-rslRed" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
