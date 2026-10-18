import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { CtaRow } from '@/components/shared/CtaButtons'
import { Section, SectionHeading } from '@/components/shared/Section'
import Screenshot from '@/components/shared/Screenshot'
import AskRslSection from '@/components/shared/AskRslSection'
import ClosingCta from '@/components/shared/ClosingCta'

const workflow = [
  { caption: 'Record the deal on mobile.', file: 'workflow-1-mobile-record.png', device: 'phone' as const },
  { caption: 'Keep track of your inventory and recorded costs.', file: 'workflow-2-mobile-inventory.png', device: 'phone' as const },
  { caption: 'Review sales, expenses, and profit on the web.', file: 'workflow-3-web-reports.png', device: 'laptop' as const },
]

const ways = [
  {
    eyebrow: 'Mobile App',
    title: 'Your business, within reach.',
    body: 'Record purchases, sales, and expenses, check your inventory, and review your numbers—at a show or wherever the day takes you.',
    link: 'Explore the Mobile App',
    href: '/mobile-app',
  },
  {
    eyebrow: 'Web App',
    title: 'See the full picture of your card business.',
    body: 'Give your numbers room. Review your inventory, recorded costs, expenses, and profit through a dashboard built for a closer look at your business.',
    link: 'Explore the Web App',
    href: '/web-app',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Header />

      {/* 1. Opening */}
      <section className="surface-grid relative overflow-hidden border-b border-line pt-24 sm:pt-28">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(232,0,28,0.2),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-6 sm:px-5 lg:grid-cols-[1fr_1.1fr] lg:px-8 lg:pb-24 lg:pt-16">
          <div>
            <SectionHeading as="h1" eyebrow="The operating system for card dealers" title="Your Card Business. Connected.">
              <p>
                Record purchases, sales, and expenses as they happen. Keep your inventory and reports connected, so you
                spend less time sorting through records and more time understanding your business.
              </p>
            </SectionHeading>
            <div className="mt-8">
              <CtaRow />
            </div>
            <p className="mt-5 max-w-xl text-sm text-neutral-400">
              We&apos;re welcoming dealers in stages. Request access and we&apos;ll email you if your account is approved.
            </p>
          </div>
          <div className="relative flex items-end justify-center">
            <Screenshot file="hero-web-dashboard.png" alt="RSL web dashboard with sample show activity" device="laptop" />
            <Screenshot
              file="hero-mobile-home.png"
              alt="RSL mobile app with the same sample activity"
              device="phone"
              className="absolute -bottom-6 right-0 max-w-[34%]! sm:right-2"
            />
          </div>
        </div>
      </section>

      {/* 2. Connected workflow */}
      <Section>
        <SectionHeading title="From the table to the bigger picture.">
          <p>
            Record a purchase or sale on your phone. Your transaction flows into your web reports, giving you a clearer
            view of your business without rebuilding the day from handwritten notes.
          </p>
        </SectionHeading>
        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {workflow.map((step, i) => (
            <li key={step.file} className="flex flex-col gap-5">
              <div className="flex items-end md:min-h-[570px] justify-center">
                <Screenshot file={step.file} alt={step.caption} device={step.device} />
              </div>
              <p className="flex gap-3 text-base font-semibold text-white">
                <span className="text-rslRed">{i + 1}.</span>
                {step.caption}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* 3. Two ways to run your day */}
      <Section className="bg-black">
        <SectionHeading title="Two ways to run your day." />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {ways.map((way) => (
            <div key={way.href} className="flex flex-col border border-white/10 bg-panel p-6 sm:p-8">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-rslRed">{way.eyebrow}</div>
              <h3 className="mt-3 text-xl font-black text-white sm:text-2xl">{way.title}</h3>
              <p className="mt-3 flex-1 text-neutral-300">{way.body}</p>
              <Link href={way.href} className="mt-6 inline-flex w-fit items-center gap-2 font-bold text-white hover:text-rslRed">
                {way.link} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* 4. Ask RSL */}
      <AskRslSection />

      {/* 5. Local connection */}
      <Section className="bg-black">
        <SectionHeading title="Rooted in Kansas City. Built for card dealers everywhere.">
          <p>
            We&apos;ve traveled to shows across the country and listened to dealers. Now we&apos;re starting close to
            home, building relationships in Kansas City and using dealer feedback to help shape RSL.
          </p>
        </SectionHeading>
        <Link href="/about" className="mt-6 inline-flex items-center gap-2 font-bold text-white hover:text-rslRed">
          Meet RSL <ArrowRight className="h-4 w-4" />
        </Link>
      </Section>

      {/* 6. Closing */}
      <ClosingCta
        title="Get a clearer view of your card business."
        body="Request access to RSL and bring your inventory, transactions, and reporting together."
      />

      <Footer />
    </main>
  )
}
