import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { CtaRow } from '@/components/shared/CtaButtons'
import { Section, SectionHeading } from '@/components/shared/Section'
import Screenshot from '@/components/shared/Screenshot'
import AskRslSection from '@/components/shared/AskRslSection'
import ClosingCta from '@/components/shared/ClosingCta'
import { WEB_DASHBOARD_SCREENSHOT } from '@/components/shared/site'

export const metadata: Metadata = {
  title: 'Web App - RSL Cards',
  description:
    "Review your inventory, purchases, sales, and expenses in one connected workspace with RSL's web dashboard.",
}

export default function WebAppPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Header />

      <section className="surface-grid border-b border-line pt-24 sm:pt-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-6 sm:px-5 lg:grid-cols-[1fr_1.15fr] lg:px-8 lg:pb-24 lg:pt-16">
          <div>
            <SectionHeading as="h1" eyebrow="Web App" title="See the full picture of your card business.">
              <p>
                Review your inventory, purchases, sales, and expenses in one connected workspace. RSL&apos;s web
                dashboard gives you room to examine your reports and understand what&apos;s happening across your
                business.
              </p>
            </SectionHeading>
            <div className="mt-8">
              <CtaRow />
            </div>
          </div>
          <Screenshot file="web-dashboard.png" src={WEB_DASHBOARD_SCREENSHOT} alt="RSL web dashboard with representative financial activity" device="laptop" />
        </div>
      </section>

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
          <SectionHeading title="Put your business numbers in context.">
            <p>
              Review revenue, cost of cards sold, recorded expenses, net profit, and profit margin. Use daily, weekly,
              monthly, or custom reporting periods to take a closer look at your results.
            </p>
          </SectionHeading>
          <Screenshot file="web-reports.png" alt="RSL reports screen with revenue, costs, expenses, and profit" device="laptop" />
        </div>
      </Section>

      <Section className="bg-black">
        <div className="grid gap-12 md:grid-cols-2">
          <SectionHeading title="Spend less time piecing the show together.">
            <p>
              Purchases and sales recorded on mobile flow into your web reports. Review your show records and recorded
              expenses without starting again from a stack of handwritten notes.
            </p>
          </SectionHeading>
          <SectionHeading title="Pick up where you left off.">
            <p>
              Use the same account on your phone and laptop. Check inventory on the go, then return to the web dashboard
              when you want a broader financial view.
            </p>
          </SectionHeading>
        </div>
      </Section>

      <AskRslSection />

      <ClosingCta title="See the full picture of your card business." showLogIn />

      <Footer />
    </main>
  )
}
