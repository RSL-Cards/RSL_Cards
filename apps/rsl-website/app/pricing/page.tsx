import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import PricingHero from '@/components/pages/pricing/PricingHero'
import PricingDownload from '@/components/pages/pricing/PricingDownload'

export const metadata: Metadata = {
  title: 'Pricing - RSL Cards Pro',
  description: 'Simple pricing for sports card dealers and collectors. Free collector app and dealer plans for growing card businesses.',
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Header ctaType="none" />
      <PricingHero />
      <PricingDownload />
    </main>
  )
}
