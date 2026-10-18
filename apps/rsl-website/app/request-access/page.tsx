import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { SectionHeading } from '@/components/shared/Section'
import RequestAccessForm from './RequestAccessForm'

export const metadata: Metadata = {
  title: 'Request Access - RSL Cards',
  description: "Tell us about your card business. We're welcoming dealers in stages.",
}

export default function RequestAccessPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Header />
      <section className="surface-grid border-b border-line pt-24 sm:pt-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-6 sm:px-5 lg:grid-cols-2 lg:px-8 lg:pb-24 lg:pt-16">
          <SectionHeading as="h1" title="Request access to RSL.">
            <p>
              Tell us a little about your card business. We&apos;re welcoming dealers in stages and will email you if
              your request is approved.
            </p>
          </SectionHeading>
          <RequestAccessForm />
        </div>
      </section>
      <Footer />
    </main>
  )
}
