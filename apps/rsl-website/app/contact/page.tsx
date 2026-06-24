import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactForm from '@/components/pages/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Contact - RSL Cards',
  description:
    'Contact RSL Cards about dealer demos, inventory management, pricing, support, and partnerships.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Header ctaType="none" />
      <section className="surface-grid border-b border-line px-5 pb-16 pt-32 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-rslRed">Contact</p>
            <h1 className="display-title mt-4 text-2xl leading-tight sm:text-3xl md:text-4xl">
              Talk to RSL Cards about dealer inventory management.
            </h1>
            <p className="mt-6 text-lg leading-8 text-neutral-300">
              Send a message about the dealer dashboard, show workflows, pricing, onboarding,
              support, or partnerships. This form currently posts to a dummy API URL and can be
              swapped to the production endpoint later.
            </p>
            <div className="mt-8 grid gap-4 text-neutral-300">
              <div className="border border-line bg-panel p-5">
                <div className="font-black text-white">Dealer demos</div>
                <p className="mt-2 leading-7">
                  See how inventory, BUY/SELL flow, reports, and listings work together.
                </p>
              </div>
              <div className="border border-line bg-panel p-5">
                <div className="font-black text-white">Inventory setup</div>
                <p className="mt-2 leading-7">
                  Ask about importing cards, consignment records, team access, and exports.
                </p>
              </div>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
      <Footer />
    </main>
  )
}
