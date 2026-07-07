import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import DealerHero from '@/components/pages/dealers/DealerHero'
import DealerStats from '@/components/pages/dealers/DealerStats'
import DealerFeatures from '@/components/pages/dealers/DealerFeatures'
import FeeCalculatorSection from '@/components/pages/dealers/FeeCalculatorSection'
import DealerOffline from '@/components/pages/dealers/DealerOffline'
import DealerDownload from '@/components/pages/dealers/DealerDownload'

export const metadata: Metadata = {
  title: 'For Dealers - RSL Cards Pro',
  description:
    'The operating system for sports card dealers. BUY/SELL flow, offline mode, multi-channel listing, profit tracking, and AI insights.',
}

export default function DealersPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Header ctaType="dealer" />
      <DealerHero />
      <DealerStats />
      <DealerFeatures />
      <FeeCalculatorSection />
      <DealerOffline />
      <DealerDownload />
      <Footer variant="dealer" />
    </main>
  )
}
