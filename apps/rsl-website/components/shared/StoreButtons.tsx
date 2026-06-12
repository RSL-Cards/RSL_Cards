import { CreditCard, Sparkles } from 'lucide-react'

export default function StoreButtons() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a className="store-badge" href="#download" aria-label="Download on the App Store">
        <CreditCard className="h-6 w-6" />
        <span>
          <span className="block text-[11px] font-bold uppercase leading-none tracking-[0.14em] text-neutral-500">
            Download on the
          </span>
          <span className="block text-lg leading-tight">App Store</span>
        </span>
      </a>
      <a className="store-badge" href="#download" aria-label="Get it on Google Play">
        <Sparkles className="h-6 w-6" />
        <span>
          <span className="block text-[11px] font-bold uppercase leading-none tracking-[0.14em] text-neutral-500">
            Get it on
          </span>
          <span className="block text-lg leading-tight">Google Play</span>
        </span>
      </a>
    </div>
  )
}
