import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LegalDocument from '@/components/pages/legal/LegalDocument'

export const metadata: Metadata = {
  title: 'Terms of Service - RSL Cards',
  description:
    'Terms for using the RSL Cards website, dealer tools, AI insights, and related services.',
}

const sections = [
  {
    title: 'Using RSL Cards',
    body: [
      'RSL Cards provides website, app, and product experiences for sports card dealers and related businesses. By using RSL Cards, you agree to use the service lawfully and in a way that respects other users and the integrity of the marketplace.',
      'You are responsible for the accuracy of information you enter, including inventory records, sale prices, consignment terms, customer details, and marketplace listings.',
    ],
  },
  {
    title: 'Accounts and access',
    body: [
      'Some features may require an account, subscription, or approved access. You are responsible for keeping login credentials secure and for activity under your account.',
      'RSL Cards may suspend or limit access if we believe an account is being misused, creates risk for the service, violates these terms, or is required to comply with law.',
    ],
  },
  {
    title: 'Plans, billing, and changes',
    body: [
      'Paid dealer plans, if offered, may be billed through RSL Cards or an authorized payment provider. Prices, features, trial periods, and limits may change over time.',
      'Unless otherwise stated at checkout, fees are charged for the selected billing period and may be non-refundable except where required by law or expressly promised by RSL Cards.',
    ],
  },
  {
    title: 'Market data and AI insights',
    body: [
      'RSL Cards may provide comps, pricing context, alerts, reports, forecasts, summaries, or AI-generated explanations. These tools are for informational and operational support only.',
      'Sports card markets can move quickly. RSL Cards does not guarantee sale outcomes, investment performance, grading results, marketplace acceptance, or the accuracy of third-party data.',
    ],
  },
  {
    title: 'User content and business records',
    body: [
      'You retain responsibility for the card records, images, notes, customer details, consignment details, and other content you add to RSL Cards.',
      'You grant RSL Cards the permission needed to host, process, display, back up, analyze, and transmit that content so we can provide and improve the service.',
    ],
  },
  {
    title: 'Acceptable use',
    body: [
      'You may not use RSL Cards to break the law, infringe intellectual property rights, upload malicious code, scrape or overload the service, misrepresent listings, manipulate market data, or interfere with another user account.',
      'You may not reverse engineer, copy, resell, or commercially exploit RSL Cards software or data except as allowed by a written agreement with RSL Cards.',
    ],
  },
  {
    title: 'Third-party services',
    body: [
      'RSL Cards may connect to marketplaces, payment tools, analytics providers, cloud platforms, or other third-party services. Those services are governed by their own terms and policies.',
      'RSL Cards is not responsible for third-party outages, listing decisions, payment disputes, marketplace rules, shipping issues, grading decisions, or external data changes.',
    ],
  },
  {
    title: 'Disclaimers and liability',
    body: [
      'RSL Cards is provided on an as-is and as-available basis. We aim to build reliable tools, but we do not promise uninterrupted service or error-free results.',
      'To the fullest extent allowed by law, RSL Cards and its owners, employees, and partners will not be liable for indirect, incidental, special, consequential, or lost-profit damages arising from use of the service.',
    ],
  },
  {
    title: 'Updates and contact',
    body: [
      'We may update these Terms of Service as the product changes. Continued use of RSL Cards after an update means you accept the revised terms.',
      'Questions about these terms can be sent to RSL Cards through the contact options provided on the website or in the app.',
    ],
  },
]

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Header ctaType="none" />
      <LegalDocument
        label="Terms"
        title="Terms of Service"
        updated="June 23, 2026"
        intro="These Terms of Service describe the basic rules for using RSL Cards, including the website, dealer tools,  AI insights, reporting, and related services."
        sections={sections}
      />
      <Footer />
    </main>
  )
}
