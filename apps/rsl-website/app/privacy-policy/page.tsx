import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LegalDocument from '@/components/pages/legal/LegalDocument'

export const metadata: Metadata = {
  title: 'Privacy Policy - RSL Cards',
  description:
    'How RSL Cards handles account, inventory, marketplace, and website information for dealers.',
}

const sections = [
  {
    title: 'Information we collect',
    body: [
      'RSL Cards may collect information you provide when you create an account, request updates, contact us, or use product features for scanning, inventory, sales, consignment, pricing, and reporting.',
      'This can include contact details, business details, card and inventory records, show or sales activity, support messages, device information, and usage data that helps us operate and improve the product.',
    ],
  },
  {
    title: 'How we use information',
    body: [
      'We use information to provide the RSL Cards website and app experience, maintain accounts, support dealer workflows, generate reports, improve pricing and AI features, prevent abuse, and communicate product updates.',
      'When RSL Cards uses market data, scans, inventory records, or sales information to improve insights, we aim to use it in a way that respects user privacy and protects sensitive business context.',
    ],
  },
  {
    title: 'Sharing and service providers',
    body: [
      'We do not sell personal information. We may share information with trusted service providers that help us host the website, run analytics, deliver email, process payments, provide support, or power app infrastructure.',
      'We may also disclose information when required by law, to protect RSL Cards and its users, or during a business transaction such as a merger, acquisition, financing, or asset transfer.',
    ],
  },
  {
    title: 'Dealer data',
    body: [
      'Inventory, customer, consignment, payout, and sales records can be sensitive business information. RSL Cards treats these records as product data used to deliver the service and support the workflows you choose to use.',
      'You are responsible for making sure any information you enter about your customers, consignors, buyers, or sellers is collected and used with proper permission.',
    ],
  },
  {
    title: 'Cookies and analytics',
    body: [
      'The website may use cookies or similar technologies to remember preferences, measure traffic, understand feature interest, and improve performance.',
      'You can control cookies through your browser settings, though some features may not work as expected if cookies are disabled.',
    ],
  },
  {
    title: 'Security and retention',
    body: [
      'We use reasonable technical and organizational safeguards designed to protect information. No online service can guarantee complete security, so users should keep account credentials private and use strong passwords.',
      'We keep information for as long as needed to provide the service, comply with legal obligations, resolve disputes, enforce agreements, and maintain accurate business records.',
    ],
  },
  {
    title: 'Your choices',
    body: [
      'You may request access, correction, export, or deletion of certain information by contacting RSL Cards. Some requests may be limited by legal, security, or operational requirements.',
      'You can unsubscribe from marketing communications at any time. We may still send important service, account, billing, or security messages.',
    ],
  },
  {
    title: 'Contact',
    body: [
      'Questions about this Privacy Policy can be sent to RSL Cards through the contact options provided on the website or in the app.',
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Header ctaType="none" />
      <LegalDocument
        label="Privacy"
        title="Privacy Policy"
        updated="June 23, 2026"
        intro="This Privacy Policy explains how RSL Cards handles information for people who visit the website or use RSL Cards products for sports card dealing, inventory, sales, and market workflows."
        sections={sections}
      />
      <Footer />
    </main>
  )
}
