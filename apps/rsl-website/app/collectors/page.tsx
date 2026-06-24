import { redirect } from 'next/navigation'

// import type { Metadata } from 'next'
// import Header from '@/components/layout/Header'
// import Footer from '@/components/layout/Footer'
// import CollectorHero from '@/components/pages/collectors/CollectorHero'
// import CollectorTrust from '@/components/pages/collectors/CollectorTrust'
// import CollectorFeatures from '@/components/pages/collectors/CollectorFeatures'
// import MarketMoversSection from '@/components/pages/collectors/MarketMoversSection'
// import CollectorDownload from '@/components/pages/collectors/CollectorDownload'

// export const metadata: Metadata = {
//   title: 'For Collectors - RSL Cards',
//   description:
//     'Free app for sports card collectors. Scan cards, track your collection, set price alerts, and get AI explanations of why prices move.',
// }

export default function CollectorsPage() {
  redirect('/dealers')

  // return (
  //   <main className="min-h-screen bg-ink text-white">
  //     <Header ctaType="download" />
  //     <CollectorHero />
  //     <CollectorTrust />
  //     <CollectorFeatures />
  //     <MarketMoversSection />
  //     <CollectorDownload />
  //     <Footer />
  //   </main>
  // )
}
