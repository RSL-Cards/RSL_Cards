import type { Metadata } from 'next'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Section, SectionHeading } from '@/components/shared/Section'
import ClosingCta from '@/components/shared/ClosingCta'

export const metadata: Metadata = {
  title: 'About Us - RSL Cards',
  description:
    'RSL brings inventory, transactions, expenses, and reporting together for card dealers. Starting in Kansas City.',
}

// Role descriptions must be confirmed with the team before publishing.
const team = [
  {
    name: 'Harris',
    image: '/team/harry.png',
    role: 'Business strategy and dealer operations',
    bio: 'Harris helps shape RSL around practical dealer workflows, useful reporting, and the day-to-day needs of running a card business.',
  },
  {
    name: 'Pav',
    image: '/team/pavan.png',
    role: 'Product, data, and technology',
    bio: 'Pav leads platform development, connecting the mobile app, web dashboard, inventory, transactions, and reporting.',
  },
  {
    name: 'Trey',
    image: '/team/trey.png',
    role: 'Finance and business operations',
    bio: 'Trey brings an accounting and financial reporting perspective to cost basis, expenses, and profitability.',
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Header />

      <section className="surface-grid border-b border-line pt-24 sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-5 lg:px-8 lg:pb-24 lg:pt-16">
          <SectionHeading as="h1" eyebrow="About Us" title="Starting in our backyard. Building around real dealer needs.">
            <p>
              After traveling to card shows across the country and listening to dealers, we kept hearing about the work
              that follows a busy show: turning handwritten purchases and sales into clear business records.
            </p>
            <p>
              RSL brings inventory, transactions, expenses, and reporting together across mobile and web. We&apos;re
              starting close to home in Kansas City, building relationships and learning from the people doing the work.
            </p>
          </SectionHeading>
        </div>
      </section>

      <Section className="bg-black">
        <SectionHeading title="Understand the business. Keep enjoying the cards.">
          <p>
            For some dealers, a show is about growing a business. For others, the relationships and experience matter
            just as much. RSL helps you understand your numbers so you can make decisions that fit what you want from
            the card business.
          </p>
        </SectionHeading>
      </Section>

      <Section>
        <SectionHeading title="The team" />
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {team.map((member) => (
            <div key={member.name} className="border border-white/10 bg-panel p-6">
              <div className="h-28 w-28 overflow-hidden rounded-full border border-white/10">
                <Image src={member.image} alt={member.name} width={112} height={112} className="h-full w-full object-cover" />
              </div>
              <h3 className="mt-5 text-xl font-black text-white">{member.name}</h3>
              <div className="mt-1 text-xs font-bold uppercase tracking-widest text-rslRed">{member.role}</div>
              <p className="mt-3 text-sm leading-relaxed text-neutral-300">{member.bio}</p>
            </div>
          ))}
        </div>
      </Section>

      <ClosingCta title="Get a clearer view of your card business."body="Request access and bring your inventory, transactions, and reporting together." />

      <Footer />
    </main>
  )
}
