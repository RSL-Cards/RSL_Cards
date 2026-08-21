'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { toast } from 'sonner'
import { 
  Search, 
  HelpCircle, 
  Smartphone, 
  ShoppingBag, 
  BarChart3, 
  CreditCard, 
  ShieldCheck, 
  Mail, 
  Clock, 
  Send, 
  ChevronDown,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  FileText,
  QrCode
} from 'lucide-react'

const TOPICS = [
  {
    id: 'mobile-app',
    icon: Smartphone,
    title: 'Mobile Dealer App',
    desc: 'AI scanner, comp lookup, quick buy/sell workflows & offline mode.',
    color: 'from-blue-600/20 to-indigo-600/20',
    borderColor: 'border-blue-500/30',
    badgeColor: 'text-blue-400 bg-blue-500/10'
  },
  {
    id: 'showcase',
    icon: QrCode,
    title: 'Dealer Showcase Page',
    desc: 'Live table QR code, public inventory link (app.rslcards.com/showcase/handle).',
    color: 'from-purple-600/20 to-pink-600/20',
    borderColor: 'border-purple-500/30',
    badgeColor: 'text-purple-400 bg-purple-500/10'
  },
  {
    id: 'marketplace',
    icon: ShoppingBag,
    title: 'Marketplace Sync',
    desc: 'eBay connection, active listing sync, and automated cross-posting.',
    color: 'from-emerald-600/20 to-teal-600/20',
    borderColor: 'border-emerald-500/30',
    badgeColor: 'text-emerald-400 bg-emerald-500/10'
  },
  {
    id: 'daily-logs',
    icon: BarChart3,
    title: 'Daily Show Logs',
    desc: 'Card show cash tracking, money in/out, and 11:00 PM log closes.',
    color: 'from-rose-600/20 to-orange-600/20',
    borderColor: 'border-rose-500/30',
    badgeColor: 'text-rose-400 bg-rose-500/10'
  },
  {
    id: 'security',
    icon: ShieldCheck,
    title: 'Account & Security',
    desc: 'Passcode reset, 2FA, OTP verification & data privacy permissions.',
    color: 'from-amber-600/20 to-yellow-600/20',
    borderColor: 'border-amber-500/30',
    badgeColor: 'text-amber-400 bg-amber-500/10'
  }
]

const FAQS = [
  {
    category: 'showcase',
    question: 'How does the Live Dealer Showcase Page work at card shows?',
    answer: 'Every RSL Cards dealer gets a unique public showcase URL (e.g. app.rslcards.com/showcase/your-handle) and shareable QR code. When collectors visit your show floor table, they can scan the QR code to browse your active card inventory, PSA/BGS grades, and asking prices live on their phones.'
  },
  {
    category: 'mobile-app',
    question: 'How does the RSL AI Scanner work at noisy card show venues?',
    answer: 'RSL Vision AI uses on-device edge acceleration combined with Google Gemini Vision models to scan physical card slabs, raw cards, and PSA/BGS barcodes. It isolates player names, set years, grade values, and cert numbers in under 1 second even in dim or high-glare convention center lighting.'
  },
  {
    category: 'mobile-app',
    question: 'What happens if my phone loses cellular/WiFi connection on the show floor?',
    answer: 'The RSL Cards app features built-in Offline Card Floor Mode. Scans, deal calculations, and inventory entries created offline are saved securely to local device storage and automatically sync to your cloud database the moment connection is restored.'
  },
  {
    category: 'marketplace',
    question: 'How do I connect my eBay seller account to sync inventory?',
    answer: 'Navigate to More > Marketplace Connections in the mobile app or Settings > Integrations in the web dashboard. Click "Connect eBay" to authorize OAuth permissions. Once connected, your active eBay listings will automatically import, and new inventory can be published in one click.'
  },
  {
    category: 'marketplace',
    question: 'Are eBay sold comps updated in real-time?',
    answer: 'Yes! RSL Cards fetches live eBay completed/sold listings and Myslabs historical sales every time you scan or search a card, displaying market averages, target buy prices, and profit margin estimates.'
  },
  {
    category: 'daily-logs',
    question: 'How do Daily Card Show Logs track cash in and money out?',
    answer: 'When you start a show day (e.g. Dallas Card Show), open a Daily Log with your starting cash drawer amount. Every Buy, Sell, Trade, or Expense transaction automatically adjusts your Money In, Money Out, and Net Profit tallies. Close your log at the end of the day for clean accounting.'
  },
  {
    category: 'security',
    question: 'How do I request a full data export or account deletion?',
    answer: 'You can export your complete inventory ledger to CSV at any time from the Web Dashboard. To delete your account and scrub stored data, go to Settings > Account > Delete Account, or submit a request directly below.'
  }
]

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'General Question',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill out all required fields.')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success('Support ticket submitted successfully!', {
        description: 'Our dealer support team will respond to ' + formData.email + ' within 2 hours.'
      })
      setFormData({ name: '', email: '', topic: 'General Question', message: '' })
    }, 1000)
  }

  const filteredFaqs = FAQS.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <Header />

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 px-5 lg:px-8 max-w-6xl mx-auto text-center overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0057FF]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#0057FF]/15 border border-[#0057FF]/30 text-[#0057FF] text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            24/7 Dealer Support &amp; Help Center
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
            How can we help your dealership today?
          </h1>

          <p className="mt-4 text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto">
            Search our knowledge base for instant answers on scanning, eBay sync, card show daily logs, or get in touch with our team.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search questions (e.g. scanner, eBay sync, cash logs)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111111] border border-white/15 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] transition-all shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-24 px-5 lg:px-8 max-w-6xl mx-auto space-y-16">
        
        {/* Support Topics Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#0057FF]" />
              Browse by Support Category
            </h2>
            {activeCategory !== 'all' && (
              <button 
                onClick={() => setActiveCategory('all')}
                className="text-xs font-bold text-[#0057FF] hover:underline"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOPICS.map((topic) => {
              const Icon = topic.icon
              const isSelected = activeCategory === topic.id
              return (
                <div
                  key={topic.id}
                  onClick={() => setActiveCategory(isSelected ? 'all' : topic.id)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer bg-gradient-to-br ${topic.color} ${
                    isSelected ? 'border-[#0057FF] ring-2 ring-[#0057FF]/30 bg-[#18181B]' : 'border-white/10 hover:border-white/20 bg-[#111111]/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${topic.badgeColor}`}>
                      {isSelected ? 'Selected' : 'Topic'}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-white mb-1">{topic.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{topic.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* FAQs Section */}
        <section className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 lg:p-10">
          <div className="mb-8">
            <div className="text-[#0057FF] text-xs font-bold uppercase tracking-wider mb-1">Knowledge Base</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-[#18181B] rounded-2xl border border-white/5">
              <HelpCircle className="w-10 h-10 text-neutral-500 mx-auto mb-3" />
              <p className="text-sm text-neutral-300 font-bold">No matching questions found.</p>
              <p className="text-xs text-neutral-500 mt-1">Try adjusting your search terms or send us a message below.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq, index) => {
                const isOpen = openFaq === index
                return (
                  <div 
                    key={index}
                    className="border border-white/10 rounded-2xl overflow-hidden bg-[#18181B] transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-[#0057FF] transition-colors"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#0057FF]' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-white/5">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Contact Form & Support Channel Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Direct Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8">
              <h3 className="text-xl font-extrabold text-white mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#0057FF]" />
                Dealer Support Desk
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                Our support engineers operate during card show hours to ensure your dealership stays running seamlessly.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#18181B] border border-white/5">
                  <Mail className="w-5 h-5 text-[#0057FF] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">Email Support</div>
                    <a href="mailto:support@rslcards.com" className="text-xs text-[#0057FF] font-semibold hover:underline">
                      support@rslcards.com
                    </a>
                    <div className="text-[11px] text-neutral-500 mt-0.5">Average response: &lt; 2 hours</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#18181B] border border-white/5">
                  <MessageSquare className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">Live Chat &amp; Fast Response</div>
                    <div className="text-xs text-neutral-300 font-medium mt-0.5">Average Response: &lt; 2 Hours</div>
                    <div className="text-[11px] text-neutral-500">Real-time dealer support during card shows</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#18181B] border border-white/5">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">Pro Dealer Priority</div>
                    <div className="text-xs text-neutral-300 leading-relaxed mt-0.5">
                      RSL Cards Pro members receive priority ticket queueing and direct technical escalation.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Documentation Links */}
            <div className="bg-[#111111] border border-white/10 rounded-3xl p-6">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Legal &amp; Policy Links
              </h4>
              <div className="flex flex-col gap-2 text-xs">
                <a href="/privacy-policy" className="text-neutral-400 hover:text-white transition-colors flex items-center justify-between py-1 border-b border-white/5">
                  <span>Privacy Policy &amp; Data Rights</span>
                  <span className="text-neutral-600">›</span>
                </a>
                <a href="/terms&conditions" className="text-neutral-400 hover:text-white transition-colors flex items-center justify-between py-1">
                  <span>Terms &amp; Conditions of Service</span>
                  <span className="text-neutral-600">›</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Ticket Form */}
          <div className="lg:col-span-7 bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8">
            <h3 className="text-2xl font-extrabold text-white mb-1">Submit a Support Ticket</h3>
            <p className="text-xs text-neutral-400 mb-6">
              Have an issue at a card show or need help setting up your account? Fill out the details below.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vinay Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0057FF] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. dealer@rslcards.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0057FF] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">Support Topic</label>
                <select
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full bg-[#18181B] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#0057FF] transition-colors"
                >
                  <option value="General Question">General Question</option>
                  <option value="Mobile App & AI Scanner">Mobile App &amp; AI Scanner</option>
                  <option value="eBay & Marketplace Sync">eBay &amp; Marketplace Sync</option>
                  <option value="Daily Card Show Logs">Daily Card Show Logs</option>
                  <option value="Account & Security">Account &amp; Security</option>
                  <option value="Bug Report or Feature Request">Bug Report / Feature Request</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Message / Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Please describe your question or issue in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#18181B] border border-white/10 rounded-xl p-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0057FF] transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0057FF] hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Sending Ticket...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Support Ticket</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

      </div>

      <Footer />
    </main>
  )
}
