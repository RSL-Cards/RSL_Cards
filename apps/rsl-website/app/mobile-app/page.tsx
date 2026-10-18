import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { RequestAccessButton } from '@/components/shared/CtaButtons'
import { Section, SectionHeading } from '@/components/shared/Section'
import Screenshot from '@/components/shared/Screenshot'
import AskRslSection from '@/components/shared/AskRslSection'
import ClosingCta from '@/components/shared/ClosingCta'
import AppStoreBadge from '@/components/shared/AppStoreBadge'
import { OFFLINE_CAPTURE_VERIFIED } from '@/components/shared/site'

export const metadata: Metadata = {
  title: 'Mobile App - RSL Cards',
  description:
    'Record purchases, sales, and expenses, check your inventory, and review your numbers at a show or wherever the day takes you.',
}

export default function MobileAppPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Header />

      <section className="surface-grid border-b border-line pt-24 sm:pt-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-6 sm:px-5 lg:grid-cols-2 lg:px-8 lg:pb-24 lg:pt-16">
          <div>
            <SectionHeading as="h1" eyebrow="Mobile App" title="Your business, within reach.">
              <p>
                Record purchases, sales, and expenses, check your inventory, and review your numbers—at a show or
                wherever the day takes you.
              </p>
            </SectionHeading>
            <div className="mt-8 flex flex-col gap-5">
              <RequestAccessButton className="w-full sm:w-fit" />
              <AppStoreBadge />
            </div>
          </div>
          <div className="flex justify-center">
            <Screenshot file="mobile-home.png" alt="RSL mobile app home screen" device="phone" />
          </div>
        </div>
      </section>

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <SectionHeading title="Keep a record while the deal is fresh.">
            <p>
              Record purchases and sales from your phone, and add expenses such as table fees, shipping, and supplies.
              Keep the details together instead of leaving the cleanup until later.
            </p>
          </SectionHeading>
          <div className="flex justify-center gap-4 sm:gap-6">
            <Screenshot file="mobile-buy-sell.png" alt="Buy and sell entry on the RSL mobile app" device="phone" />
            <Screenshot file="mobile-expense.png" alt="Adding an expense to an open show log" device="phone" />
          </div>
        </div>
      </Section>

      <Section className="bg-black">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="order-last flex justify-center lg:order-first">
            <Screenshot file="mobile-inventory.png" alt="Inventory with recorded costs on the RSL mobile app" device="phone" />
          </div>
          <SectionHeading title="Know what you have with you.">
            <p>
              Take a quick look at your inventory, check recorded costs, and review your card history without opening
              your laptop.
            </p>
            <p className="text-base text-neutral-400">A card scanner is available to help with card entry.</p>
          </SectionHeading>
        </div>
      </Section>

      <AskRslSection
        title="Check your numbers without leaving the floor."
        body="Review your performance and show logs on your phone, or ask RSL questions about your inventory and show profit. Your web dashboard is there when you want more room to review."
      />

      {OFFLINE_CAPTURE_VERIFIED && (
        <Section className="bg-black">
          <SectionHeading title="Keep a record when the signal drops.">
            <p>
              Preload your inventory before a show and record purchases without an internet connection. Full card
              identification may need to wait until you&apos;re connected.
            </p>
          </SectionHeading>
        </Section>
      )}

      <ClosingCta title="Your business, within reach.">
        <AppStoreBadge />
      </ClosingCta>

      <Footer />
    </main>
  )
}
