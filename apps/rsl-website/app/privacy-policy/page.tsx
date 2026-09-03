import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - RSL Cards',
  description: 'Privacy Policy detailing data collection, device permissions, and security across the RSL Cards Mobile App and Web Dashboard.',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <Header />

      <div className="pt-28 pb-20 px-5 lg:px-8 max-w-4xl mx-auto">
        {/* Header Title */}
        <div className="border-b border-white/10 pb-8 mb-10">
          <div className="inline-block bg-[#0057FF]/15 border border-[#0057FF]/30 text-[#0057FF] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
            Data &amp; Privacy Protection
          </div>
          <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-neutral-400 text-sm">
            Last Updated: August 21, 2026
          </p>
        </div>

        {/* Policy Content */}
        <div className="space-y-10 text-neutral-300 text-sm leading-relaxed">
          {/* Section 1: Overview */}
          <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0057FF] text-xs font-black text-white">1</span>
              Overview &amp; Scope
            </h2>
            <p>
              At RSL Cards (&quot;RSL Cards Pro&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), we respect your privacy and are committed to protecting the personal and business data of our sports card dealers and collectors.
            </p>
            <p className="mt-3">
              This Privacy Policy explains what information we collect, how it is used, and how your data is protected across both our platforms:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-neutral-300 pl-2">
              <li><strong className="text-white">RSL Cards Mobile App</strong> for iOS and Android.</li>
              <li><strong className="text-white">RSL Cards Web</strong> at <code className="text-blue-400">app.rslcards.com</code> / <code className="text-blue-400">rslcards.com</code>.</li>
            </ul>
          </section>

          {/* Section 2: Mobile App Data Collection */}
          <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0057FF] text-xs font-black text-white">2</span>
              Information We Collect &amp; Permissions Requested in the Mobile App
            </h2>
            <p className="mb-4">
              When using the <strong className="text-white">RSL Cards Mobile App</strong>, we request specific hardware permissions strictly to power core dealership features:
            </p>

            <div className="space-y-4">
              {/* Permission 1 */}
              <div className="bg-[#18181B] border border-white/5 p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-[#0057FF]/20 text-[#0057FF] text-xs font-black px-2.5 py-1 rounded">📷 CAMERA &amp; PHOTO LIBRARY</span>
                  <h3 className="font-bold text-white text-base">RSL Vision AI Scanner &amp; Photo Uploads</h3>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  <strong className="text-white">What we access:</strong> Camera video stream, photo captures, and selected photo library images.
                  <br />
                  <strong className="text-white">Why we ask:</strong> To scan physical sports card slabs, raw cards, and barcodes via computer vision AI (Gemini Vision) to automatically extract player names, sets, years, variations, cert numbers, and grades. Also used to capture inventory photos and dealer profile avatars. Photos are processed securely and are never shared publicly without your authorization.
                </p>
              </div>

              {/* Permission 2 */}
              <div className="bg-[#18181B] border border-white/5 p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-[#E8001C]/20 text-[#E8001C] text-xs font-black px-2.5 py-1 rounded">🔔 PUSH NOTIFICATIONS</span>
                  <h3 className="font-bold text-white text-base">Real-Time Operational Alerts</h3>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  <strong className="text-white">What we access:</strong> Device push notification tokens via OneSignal &amp; Expo Notifications.
                  <br />
                  <strong className="text-white">Why we ask:</strong> To send real-time alerts for Market Price Spikes (&gt;10%), Stagnant Inventory Aging (&gt;60 days unlisted), marketplace sync status, and 11:00 PM daily card show log close reminders. You can customize or disable push channels at any time in Notification Preferences.
                </p>
              </div>

              {/* Permission 3 */}
              <div className="bg-[#18181B] border border-white/5 p-5 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-[#00C853]/20 text-[#00C853] text-xs font-black px-2.5 py-1 rounded">💳 PAYMENT HANDLES &amp; DEALER PROFILE</span>
                  <h3 className="font-bold text-white text-base">Public Payout Handles</h3>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  <strong className="text-white">What you provide:</strong> Venmo handles (<code className="text-blue-400">@handle</code>), CashApp cashtags (<code className="text-green-400">$cashtag</code>), Zelle contact info, and PayPal email addresses.
                  <br />
                  <strong className="text-white">Why we ask:</strong> Configured payment handles are displayed on customer deal screens or show floor QR codes so buyers can easily send payments directly to your dealership.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Web Dashboard Data Collection */}
          <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0057FF] text-xs font-black text-white">3</span>
              Information We Collect in RSL Cards Web &amp; Backend
            </h2>
            <p className="mb-4">
              When accessing <strong className="text-white">RSL Cards Web</strong> or backend services:
            </p>

            <ul className="space-y-3 text-xs text-neutral-300">
              <li className="bg-[#18181B] border border-white/5 p-4 rounded-xl">
                <strong className="text-white text-sm block mb-1">Account &amp; OAuth Authentication Credentials:</strong>
                Email address, salted &amp; hashed password, 6-digit email OTP verification tokens, and Google / Apple OAuth ID tokens (name, email address, profile photo URL).
              </li>
              <li className="bg-[#18181B] border border-white/5 p-4 rounded-xl">
                <strong className="text-white text-sm block mb-1">Inventory &amp; Dealership Ledgers:</strong>
                Card inventory items (year, set, grade, cost basis, target prices, market comps), buy/sell/trade transactions, card show daily logs, cash adjustments, gross revenue, and profit margins.
              </li>
              <li className="bg-[#18181B] border border-white/5 p-4 rounded-xl">
                <strong className="text-white text-sm block mb-1">Marketplace OAuth Tokens:</strong>
                Connected third-party tokens (e.g. eBay access tokens) to allow seamless multi-channel listing creation, inventory syncing, and order import.
              </li>
              <li className="bg-[#18181B] border border-white/5 p-4 rounded-xl">
                <strong className="text-white text-sm block mb-1">Technical Analytics &amp; Cookies:</strong>
                IP address, browser type, operating system, API performance metrics, and secure HTTP-only session cookies to maintain your authenticated session.
              </li>
            </ul>
          </section>

          {/* Section 4: How We Use Information */}
          <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0057FF] text-xs font-black text-white">4</span>
              How We Use Your Information
            </h2>
            <p>We use collected data solely to deliver, improve, and secure our dealership software:</p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-neutral-300 pl-2">
              <li>Processing computer vision scanning and instant market comp calculations.</li>
              <li>Maintaining your inventory ledger, cost basis, profit analytics, and card show logs.</li>
              <li>Syncing listings and sales across connected platforms like eBay.</li>
              <li>Delivering requested operational notifications (Price Spikes, Aging Inventory, Daily Log reminders).</li>
              <li>Preventing unauthorized access, fraud, and ensuring backend API security.</li>
            </ul>
          </section>

          {/* Section 5: Data Protection & Sharing */}
          <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0057FF] text-xs font-black text-white">5</span>
              Data Protection &amp; Third-Party Sharing
            </h2>
            <p className="font-bold text-[#00C853] text-base mb-2">
              ✓ We NEVER sell your personal data, inventory lists, or financial ledgers to third parties.
            </p>
            <p>
              We share information strictly with trusted infrastructure and service partners necessary to run our software:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 text-neutral-300 pl-2">
              <li><strong className="text-white">Cloud Infrastructure &amp; Database:</strong> Secure encrypted databases (PostgreSQL/Supabase) and Redis caching servers.</li>
              <li><strong className="text-white">AI Processing:</strong> Google Gemini / Vertex AI for processing computer vision scans and assistant queries.</li>
              <li><strong className="text-white">Marketplace APIs:</strong> eBay API when you explicitly connect your eBay seller account.</li>
              <li><strong className="text-white">Notification Services:</strong> OneSignal &amp; Expo Push for alert delivery.</li>
            </ul>
          </section>

          {/* Section 6: Security & Retention */}
          <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0057FF] text-xs font-black text-white">6</span>
              Security &amp; Data Encryption
            </h2>
            <p>
              All network communication is encrypted using TLS 1.3 / HTTPS. Account tokens and sensitive credentials are encrypted at rest (AES-256) and stored securely on mobile devices using iOS Keychain and Android Keystore (via Expo SecureStore).
            </p>
          </section>

          {/* Section 7: Account Deletion & Data Erasure */}
          <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0057FF] text-xs font-black text-white">7</span>
              Account Deletion &amp; Data Erasure
            </h2>
            <p>
              You have the full right to delete your RSL Cards account and all associated data at any time directly within the mobile application or by submitting a deletion request to our privacy team.
            </p>

            <div className="mt-4 bg-[#18181B] border border-white/5 p-5 rounded-xl space-y-3">
              <h3 className="font-bold text-white text-sm">How to Delete Your Account In-App:</h3>
              <ol className="list-decimal list-inside space-y-2 text-xs text-neutral-300 pl-1">
                <li>Open the <strong className="text-white">RSL Cards Pro</strong> mobile app.</li>
                <li>Tap the <strong className="text-white">More</strong> tab in the bottom navigation and select <strong className="text-white">Account Settings &amp; Profile</strong> (or tap Edit on your profile card).</li>
                <li>Scroll to the <strong className="text-white">Account Actions</strong> section at the bottom.</li>
                <li>Tap <strong className="text-red-400">Delete Account</strong>.</li>
                <li>Confirm deletion in the confirmation dialog.</li>
              </ol>
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-xs text-red-400 leading-relaxed font-semibold">
                  ⚠️ What happens when you delete your account: All inventory listings, sales &amp; buy ledgers, card show logs, connected marketplace tokens (e.g. eBay), push notification tokens, and authentication credentials are permanently and irreversibly purged from our database immediately.
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-neutral-300">
              You can also request manual account and data deletion by emailing <a href="mailto:support@rslcards.com?subject=Account%20Deletion%20Request" className="text-blue-400 underline font-medium">support@rslcards.com</a> with the subject line &quot;Account Deletion Request&quot; from your registered email address.
            </p>
          </section>

          {/* Section 8: Contact Us */}
          <section className="bg-[#111111] border border-white/10 rounded-2xl p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0057FF] text-xs font-black text-white">8</span>
              Contact Us &amp; Privacy Officer
            </h2>
            <p>
              If you have any questions or concerns regarding this Privacy Policy or your data, please reach out to us:
            </p>
            <div className="mt-4 p-4 bg-[#18181B] rounded-xl border border-white/5">
              <p className="font-bold text-white">RSL Cards Data Protection &amp; Privacy Office</p>
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
