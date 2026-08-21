import { ArrowRight, Layers, TrendingUp, DollarSign, PieChart, QrCode, CheckCircle2, Sparkles } from 'lucide-react'

const features = [
  {
    title: 'Inventory & Operations',
    description: 'Organize cards, purchases, sales, and show activity in one place.',
    icon: Layers,
  },
  {
    title: 'Digital Dealer Showcase',
    description: 'Share your live digital showcase link or table QR code so buyers browse your active inventory on their phones at card shows.',
    icon: QrCode,
  },
  {
    title: 'Player & Market Insights',
    description: 'Connect verified player performance, news, and market movement to relevant inventory.',
    icon: TrendingUp,
  },
  {
    title: 'Buying & Selling Context',
    description: 'Use instant comps and market information to support more informed pricing decisions.',
    icon: DollarSign,
  },
  {
    title: 'Dealer Dashboard & Reporting',
    description: 'Get full visibility into your activity, inventory value, transaction history, and profitability.',
    icon: PieChart,
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="border-b border-line bg-ink py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-16 md:text-center">
          <h2 className="display-title text-3xl text-white sm:text-4xl md:text-5xl">
            Everything you need for the show floor
          </h2>
          <p className="mt-4 text-lg text-neutral-400 md:mx-auto md:max-w-2xl">
            RSL Cards is a connected system. From the mobile app in your pocket to the full dealer dashboard and live public showcase.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <div key={idx} className="border border-white/10 bg-panel p-8 transition hover:border-white/20 rounded-xl">
              <feature.icon className="h-8 w-8 text-rslRed" />
              <h3 className="mt-4 text-xl font-black text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-neutral-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Live Dealer Showcase Highlight Feature */}
        <div className="mt-16 overflow-hidden rounded-2xl border border-white/10 bg-panel grid md:grid-cols-2">
          <div className="flex flex-col justify-center p-8 md:p-12">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0057FF] bg-[#0057FF]/15 border border-[#0057FF]/30 px-3 py-1 rounded-full self-start mb-4">
              <QrCode className="w-3.5 h-3.5" />
              Card Show Table Showcase
            </div>
            <h3 className="text-2xl lg:text-3xl font-black text-white leading-tight">
              Let Buyers Browse Your Entire Table Inventory Digitally
            </h3>
            <p className="mt-4 text-base text-neutral-300 leading-relaxed">
              Never miss a deal when your table is crowded. Place your custom QR code on your card show display so collectors can scan and browse your active inventory, PSA/BGS grades, and asking prices directly on their smartphones.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Instant Table QR Code Generation
              </span>
              <span className="flex items-center gap-2 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3.5 py-2 rounded-xl">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Personalized Dealer Showcase Handle
              </span>
            </div>
          </div>
          <div className="relative min-h-[280px] border-t border-white/10 bg-[#09090B] p-6 md:border-l md:border-t-0 flex items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141414] p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E8001C] flex items-center justify-center text-white font-extrabold text-sm">
                    VK
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      Vinay Cards
                      <span className="bg-[#0057FF]/20 text-[#0057FF] text-[9px] font-black px-1.5 py-0.5 rounded">PRO</span>
                    </div>
                    <div className="text-[11px] text-neutral-400">Dallas Card Show Table #42</div>
                  </div>
                </div>
                <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">
                  Live Showcase
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#1C1C1E] p-3 rounded-xl border border-white/5">
                  <div className="font-bold text-white text-xs truncate">Messi Prizm WC</div>
                  <div className="text-[10px] text-amber-400 font-bold mt-0.5">PSA 10</div>
                  <div className="text-sm font-extrabold text-white mt-1">$1,450.00</div>
                </div>
                <div className="bg-[#1C1C1E] p-3 rounded-xl border border-white/5">
                  <div className="font-bold text-white text-xs truncate">Haaland Chrome</div>
                  <div className="text-[10px] text-amber-400 font-bold mt-0.5">PSA 10</div>
                  <div className="text-sm font-extrabold text-white mt-1">$850.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real Time Market Movements */}
        <div className="mt-8 grid overflow-hidden rounded-2xl border border-white/10 bg-panel md:grid-cols-2">
          <div className="flex flex-col justify-center p-8 md:p-12">
            <h3 className="text-2xl font-black text-white">Real-Time Market Movements</h3>
            <p className="mt-4 text-lg text-neutral-300">
              When Patrick Mahomes throws 3 TDs, his card prices react instantly. RSL Cards connects verified performance to your inventory, showing you exactly how your assets are trending in real-time.
            </p>
            <div className="mt-6 flex items-center gap-4 text-sm font-bold text-green-400">
              <TrendingUp className="h-5 w-5" />
              <span>Mahomes Prizm PSA 10 up 14%</span>
            </div>
          </div>
          <div className="relative min-h-[300px] border-t border-white/10 bg-black md:border-l md:border-t-0">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="w-full max-w-sm rounded-xl border border-line bg-ink p-6 shadow-2xl">
                <div className="flex items-center gap-4 border-b border-line pb-4">
                  <div className="h-12 w-12 rounded-full bg-rslRed flex items-center justify-center text-white font-black text-xl">PM</div>
                  <div>
                    <div className="font-black text-white">Patrick Mahomes</div>
                    <div className="text-sm text-neutral-400">KC • QB</div>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Market Trend (7d)</span>
                    <span className="font-bold text-green-400">+14.2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Inventory Impact</span>
                    <span className="font-bold text-white">+$120.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <a
            href="https://app.rslcards.com/login"
            className="inline-flex items-center gap-2 bg-rslRed px-8 py-4 text-base font-black text-white transition hover:bg-white hover:!text-black"
          >
            Be First to Use RSL Cards <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  )
}
