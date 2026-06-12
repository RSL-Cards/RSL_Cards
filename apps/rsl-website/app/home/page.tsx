import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/pages/home/HeroSection'
import TrustSection from '@/components/pages/home/TrustSection'
import ProblemSection from '@/components/pages/home/ProblemSection'
import PillarsSection from '@/components/pages/home/PillarsSection'
import AiNarrativeSection from '@/components/pages/home/AiNarrativeSection'
import EcosystemSection from '@/components/pages/home/EcosystemSection'
import WorkflowSection from '@/components/pages/home/WorkflowSection'
import OfflineSection from '@/components/pages/home/OfflineSection'
import TestimonialsSection from '@/components/pages/home/TestimonialsSection'
import ShowFinderSection from '@/components/pages/home/ShowFinderSection'
import DownloadSection from '@/components/pages/home/DownloadSection'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Header ctaType="download" />
      <HeroSection />
      <TrustSection />
      <ProblemSection />
      <PillarsSection />
      <AiNarrativeSection />
      <EcosystemSection />
      <WorkflowSection />
      <OfflineSection />
      <TestimonialsSection />
      <ShowFinderSection />
      <DownloadSection />
      <Footer variant="default" />
    </main>
  )
}
