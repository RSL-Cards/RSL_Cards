import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PricingHero from '@/components/pages/pricing/PricingHero'
import PricingDownload from '@/components/pages/pricing/PricingDownload'

export const metadata: Metadata = {
  title: 'Pricing - RSL Cards Pro',
  description: 'Simple pricing for sports card dealers. Dealer plans for inventory management, show workflows, and growing card businesses.',
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Header ctaType="none" />
      <PricingHero />
      <PricingDownload />
      <Footer />
    </main>
  )
}
