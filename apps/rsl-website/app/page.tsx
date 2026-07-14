import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ComingSoonSection from '@/components/pages/home/ComingSoonSection'
import FeaturesSection from '@/components/pages/home/FeaturesSection'
import AboutSection from '@/components/pages/home/AboutSection'

export default function RootPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Header />
      <ComingSoonSection />
      <FeaturesSection />
      <AboutSection />
      <Footer />
    </main>
  )
}
