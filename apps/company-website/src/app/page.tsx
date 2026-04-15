import Navbar from '@/components/marketing/Navbar'
import HeroSection from '@/components/marketing/HeroSection'
import StatsSection from '@/components/marketing/StatsSection'
import FeaturesSection from '@/components/marketing/FeaturesSection'
import HowItWorksSection from '@/components/marketing/HowItWorksSection'
import PlatformIntegrationsSection from '@/components/marketing/PlatformIntegrationsSection'
import AnalyticsPreviewSection from '@/components/marketing/AnalyticsPreviewSection'
import AINarrativeFeature from '@/components/marketing/AINarrativeFeature'
import TestimonialsSection from '@/components/marketing/TestimonialsSection'
import PricingSection from '@/components/marketing/PricingSection'
import CTASection from '@/components/marketing/CTASection'
import Footer from '@/components/marketing/Footer'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PlatformIntegrationsSection />
      <AnalyticsPreviewSection />
      <AINarrativeFeature />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  )
}
