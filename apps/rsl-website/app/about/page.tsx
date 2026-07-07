import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AboutHero from '@/components/pages/about/AboutHero'

export const metadata: Metadata = {
  title: 'About - RSL Cards',
  description: 'RSL Cards was built to give sports card dealers the operating system their business deserves.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Header ctaType="none" />
      <AboutHero />
      <Footer />
    </main>
  )
}
