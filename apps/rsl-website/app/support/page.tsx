import type { Metadata } from 'next'
import { ChevronDown, Mail } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Section, SectionHeading } from '@/components/shared/Section'
import { OFFLINE_CAPTURE_VERIFIED, SUPPORT_EMAIL } from '@/components/shared/site'
import SupportForm from './SupportForm'

export const metadata: Metadata = {
  title: 'Support - RSL Cards',
  description: 'Answers to common RSL questions, and how to reach the RSL team.',
}

const faqs = [
  {
    question: 'How do I get access?',
    answer:
      "Submit a request with your name, email, and dealer type. We review requests as we bring dealers onto RSL. If approved, you'll receive an invitation to finish setting up your account.",
  },
  {
    question: 'Do I need separate accounts for mobile and web?',
    answer: 'No. Your approved RSL account works across both.',
  },
  {
    question: 'Can I request access outside Kansas City?',
    answer: 'Yes. Dealers anywhere can request access. Kansas City is our starting community, not an access restriction.',
  },
  {
    question: 'Is RSL for sports cards or TCG?',
    answer: 'RSL is built for dealers working with sports cards and TCG.',
  },
  {
    question: 'Can I record expenses?',
    answer: 'Yes. Record expenses such as show fees, shipping, and supplies to include recorded costs in your profit reporting.',
  },
  {
    question: 'Does the mobile app include reports?',
    answer: 'Yes. Mobile provides performance views and daily logs. The web app offers a more expansive layout for financial review.',
  },
  ...(OFFLINE_CAPTURE_VERIFIED
    ? [
        {
          question: 'Can I use RSL without internet?',
          answer:
            'You can preload inventory and record purchases offline. Full card identification may require a connection.',
        },
      ]
    : []),
]

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Header />

      <section className="surface-grid border-b border-line pt-24 sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-5 lg:px-8 lg:pb-20 lg:pt-16">
          <SectionHeading as="h1" eyebrow="Support" title="Help with your day-to-day RSL questions.">
            <p>
              Find answers below, email{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold text-white underline underline-offset-4">
                {SUPPORT_EMAIL}
              </a>
              , or use Help &amp; Support in the app.
            </p>
          </SectionHeading>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-8 inline-flex items-center gap-2 bg-rslRed px-7 py-3.5 text-base font-black text-white transition hover:bg-white hover:!text-black"
          >
            <Mail className="h-5 w-5" /> Email Support
          </a>
        </div>
      </section>

      <Section>
        <SectionHeading title="Frequently asked questions" />
        <div className="mt-8 max-w-3xl divide-y divide-white/10 border-y border-white/10">
          {faqs.map((faq) => (
            <details key={faq.question} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-base font-bold text-white focus-visible:outline-2 focus-visible:outline-white sm:text-lg [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown className="h-5 w-5 shrink-0 text-neutral-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="pb-5 leading-relaxed text-neutral-300">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      <Section className="bg-black">
        <div className="grid gap-10 lg:grid-cols-2">
          <SectionHeading title="Send us a message.">
            <p>Prefer a form? Tell us what you need and we&apos;ll reply by email.</p>
          </SectionHeading>
          <SupportForm />
        </div>
      </Section>

      <Footer />
    </main>
  )
}
