import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import FeaturesHero from '@/components/pages/features/FeaturesHero'
import FeaturesGrid from '@/components/pages/features/FeaturesGrid'
import CompetitorComparison from '@/components/pages/features/CompetitorComparison'
import FeaturesAi from '@/components/pages/features/FeaturesAi'
import FeaturesDownload from '@/components/pages/features/FeaturesDownload'

export const metadata: Metadata = {
  title: 'Features - RSL Cards',
  description:
    'Complete feature breakdown for RSL Cards Pro, collectors, AI Engine, offline mode, and multi-channel listing.',
}

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Header ctaType="download" />
      <FeaturesHero />
      <FeaturesGrid />
      <CompetitorComparison />
      <FeaturesAi />
      <FeaturesDownload />
    </main>
  )
}
