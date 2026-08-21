import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions - RSL Cards',
  description: 'Terms and Conditions of Service for RSL Cards Dealer Mobile App and Web Dashboard.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <Header />

      <div className="pt-28 pb-20 px-5 lg:px-8 max-w-4xl mx-auto">
        {/* Header Title */}
        <div className="border-b border-white/10 pb-8 mb-10">
          <div className="inline-block bg-[#E8001C]/15 border border-[#E8001C]/30 text-[#E8001C] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
            Legal Agreement
          </div>
          <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="mt-3 text-neutral-400 text-sm">
            Last Updated: August 21, 2026
          </p>
        </div>

        {/* Legal Document Content */}
        <div className="space-y-10 text-neutral-300 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8001C] text-xs font-black text-white">1</span>
              Acceptance of Terms
            </h2>
            <p>
              Welcome to RSL Cards. These Terms &amp; Conditions (&quot;Terms&quot;) govern your access to and use of the RSL Cards software ecosystem, including the <strong className="text-white">RSL Cards Mobile App</strong>, <strong className="text-white">RSL Cards Web</strong>, and all related APIs, features, and services (collectively, the &quot;Services&quot;).
            </p>
            <p className="mt-3">
              By creating an account, downloading the mobile app, or accessing the web dashboard, you agree to be legally bound by these Terms. If you do not agree to these Terms, you may not use the Services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8001C] text-xs font-black text-white">2</span>
              Account Registration &amp; Dealer Eligibility
            </h2>
            <p>
              To access the Services, you must register a dealer account. You represent and warrant that:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-neutral-300 pl-2">
              <li>You are at least 18 years of age or possess legal business capacity to enter binding contracts.</li>
              <li>All information provided during registration (including email, name, business details, and payment handles) is accurate and complete.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8001C] text-xs font-black text-white">3</span>
              Description of Services
            </h2>
            <p>
              RSL Cards provides specialized management software designed for sports card dealers and collectors:
            </p>
            <div className="grid gap-4 mt-4 md:grid-cols-2">
              <div className="bg-[#18181B] border border-white/5 p-4 rounded-xl">
                <h3 className="font-bold text-white text-sm mb-1">RSL Vision AI Scanner</h3>
                <p className="text-xs text-neutral-400">
                  Computer vision and AI tools to identify card players, sets, years, variations, slab barcodes, and grading metrics.
                </p>
              </div>
              <div className="bg-[#18181B] border border-white/5 p-4 rounded-xl">
                <h3 className="font-bold text-white text-sm mb-1">Inventory &amp; Market Comps</h3>
                <p className="text-xs text-neutral-400">
                  Real-time sales comp analytics, median market pricing, cost basis tracking, and profit margins.
                </p>
              </div>
              <div className="bg-[#18181B] border border-white/5 p-4 rounded-xl">
                <h3 className="font-bold text-white text-sm mb-1">Card Show &amp; Daily Logs</h3>
                <p className="text-xs text-neutral-400">
                  On-floor card show tracking, net cash adjustments, daily log closes, and transactional ledgers.
                </p>
              </div>
              <div className="bg-[#18181B] border border-white/5 p-4 rounded-xl">
                <h3 className="font-bold text-white text-sm mb-1">Multi-Channel Syncing</h3>
                <p className="text-xs text-neutral-400">
                  Listing creation and automated inventory synchronization across eBay and integrated channels.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8001C] text-xs font-black text-white">4</span>
              Data Accuracy, Dealer Management Tool &amp; Non-Liability Disclaimer
            </h2>

            <div className="mb-4 p-4 bg-[#E8001C]/10 border border-[#E8001C]/30 rounded-xl">
              <p className="font-bold text-[#E8001C] text-xs uppercase tracking-wider mb-1">
                ⚠️ Important Notice for Dealers
              </p>
              <p className="text-xs text-neutral-300">
                RSL Cards is strictly an operational software tool for dealer management. All pricing, sales comps, and AI scanner results are displayed based on available data feeds and may contain inaccuracies. RSL Cards accepts zero liability for pricing errors, bad transactions, or financial decisions made using the platform.
              </p>
            </div>

            <div className="space-y-4 text-neutral-300 text-sm">
              <p>
                <strong className="text-white">A. Display of Available Data (&quot;As-Is&quot; Basis):</strong> All information displayed across the mobile app and web portal—including historical market sales comps, estimated card values, median price trend charts, inventory valuation summaries, and computer vision AI scanner outputs—is provided strictly on an <strong className="text-white">&quot;AS-IS&quot; and &quot;AS-AVAILABLE&quot; basis</strong>.
              </p>
              <p>
                <strong className="text-white">B. No Guarantee of Accuracy:</strong> RSL Cards does <strong className="text-white">NOT guarantee or warrant</strong> that any data, sales comps, market pricing, player/set identification, or grading data is 100% accurate, complete, or error-free. Secondary sports card markets fluctuate rapidly, and third-party data sources or AI models may contain delays, inaccuracies, or misclassifications.
              </p>
              <p>
                <strong className="text-white">C. Sole Responsibility of the Dealer:</strong> RSL Cards provides software for inventory organization and dealer productivity—it is NOT a financial broker, professional appraiser, or advisory service. You, as the dealer, are <strong className="text-white">solely and exclusively responsible for independently verifying card details, raw/graded condition, and setting your own buy, sell, and trade prices</strong>.
              </p>
              <p>
                <strong className="text-white">D. Absolute Non-Liability:</strong> Under no circumstances shall RSL Cards, its operators, developers, or affiliates be liable or responsible for any financial losses, lost profits, bad purchases, misidentified cards, pricing discrepancies, or business decisions made by you or your dealership based on data shown within the app or web dashboard.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8001C] text-xs font-black text-white">5</span>
              Third-Party Integrations
            </h2>
            <p>
              The Services integrate with third-party platforms, including eBay APIs, OAuth providers (Google, Apple), and payment networks (Venmo, CashApp, Zelle, PayPal).
            </p>
            <p className="mt-3">
              Your use of third-party platforms is subject to their respective terms of service and privacy policies. RSL Cards is not responsible for third-party service outages, account suspensions, or marketplace fee changes enforced by third parties.
            </p>
          </section>

          {/* Section 6 */}
          <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8001C] text-xs font-black text-white">6</span>
              Prohibited Activities
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-neutral-300 pl-2">
              <li>Reverse engineer, decompile, or attempt to extract source code from the mobile app or web dashboard.</li>
              <li>Automate unauthorized web scraping, API spamming, or denial-of-service attacks.</li>
              <li>Use the Services for fraudulent transactions, counterfeit card listings, or unlawful activities.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8001C] text-xs font-black text-white">7</span>
              Limitation of Liability &amp; Termination
            </h2>
            <p>
              To the maximum extent permitted by law, RSL Cards shall not be liable for indirect, incidental, special, or consequential damages resulting from lost sales, computer vision discrepancies, or service interruptions.
            </p>
            <p className="mt-3">
              We reserve the right to suspend or terminate accounts that violate these Terms or engage in abusive platform behavior.
            </p>
          </section>

          {/* Section 8 */}
          <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8001C] text-xs font-black text-white">8</span>
              Contact Information
            </h2>
            <p>
              For legal inquiries or questions regarding these Terms &amp; Conditions, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-[#18181B] rounded-xl border border-white/5">
              <p className="font-bold text-white">RSL Cards Legal Team</p>
              <p className="text-xs text-neutral-400 mt-1">Email: support@rslcards.com</p>
              <p className="text-xs text-neutral-400">Website: rslcards.com</p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
