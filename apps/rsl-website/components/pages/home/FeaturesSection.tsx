import { ArrowRight, Layers, TrendingUp, DollarSign, PieChart, QrCode, CheckCircle2, Sparkles, Repeat, WifiOff, ShieldCheck } from 'lucide-react'

const features = [
  {
    title: 'Inventory & Cost Basis',
    description: 'Track sports cards & TCG (Pokémon, One Piece, Magic) with exact cost basis, purchase sources, aging stock alerts, and target sale prices.',
    icon: Layers,
  },
  {
    title: 'Dealer-to-Dealer Transactions',
    description: 'Run complex multi-card trades, cash + trade splits, wholesale lot transfers, and dealer-to-dealer trade night ledgers in seconds.',
    icon: Repeat,
  },
  {
    title: 'Instant Comps & Market Value',
    description: 'Live sold comps across eBay completed, 130point, and Myslabs for both graded slabs (PSA, BGS, CGC, SGC) and raw cards.',
    icon: DollarSign,
  },
  {
    title: 'Offline Show Floor Engine',
    description: 'Operate with zero WiFi or cell signal at crowded convention centers. Log buys, sells, and trades with automatic cloud sync when signal returns.',
    icon: WifiOff,
  },
  {
    title: 'Digital Table Showcase',
    description: 'Place a custom QR code on your showcase so buyers browse your active inventory, grades, and asking prices directly on their phones.',
    icon: QrCode,
  },
  {
    title: 'Daily Show Logs & Accounting',
    description: 'Track starting cash drawers, Money In, Money Out, expenses, and net profit margins for clean, tax-ready show-day accounting.',
    icon: PieChart,
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="border-b border-line bg-ink py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-12 sm:mb-16 text-left sm:text-center">
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-rslRed">
            The Operating System for Dealers
          </div>
          <h2 className="display-title text-2xl sm:text-4xl md:text-5xl text-white">
            Everything you need for the show floor &amp; shop
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-neutral-400 sm:mx-auto sm:max-w-2xl">
            RSL Cards is the unified operating system for card dealers. Sports cards, TCG singles, show tables, and dealer-to-dealer transactions—all connected in real-time.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <div key={idx} className="border border-white/10 bg-panel p-6 sm:p-8 transition hover:border-white/20 rounded-xl">
              <feature.icon className="h-7 w-7 sm:h-8 sm:w-8 text-rslRed" />
              <h3 className="mt-4 text-lg sm:text-xl font-black text-white">{feature.title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Live Dealer Showcase Highlight Feature */}
        <div className="mt-12 sm:mt-16 overflow-hidden rounded-2xl border border-white/10 bg-panel grid md:grid-cols-2">
          <div className="flex flex-col justify-center p-6 sm:p-8 md:p-12">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0057FF] bg-[#0057FF]/15 border border-[#0057FF]/30 px-3 py-1 rounded-full self-start mb-4">
              <QrCode className="w-3.5 h-3.5" />
              Card Show Table Showcase
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
              Let Buyers Browse Your Entire Table Inventory Digitally
            </h3>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-neutral-300 leading-relaxed">
              Never miss a deal when your table is crowded. Place your custom QR code on your card show display so collectors can scan and browse your active sports and TCG inventory, PSA/BGS/CGC grades, and asking prices directly on their smartphones.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                Table QR Code Generation
              </span>
              <span className="flex items-center gap-2 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                Personalized Showcase URL
              </span>
            </div>
          </div>
          <div className="relative min-h-[260px] border-t border-white/10 bg-[#09090B] p-4 sm:p-6 md:border-l md:border-t-0 flex items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141414] p-4 sm:p-5 shadow-2xl space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E8001C] flex items-center justify-center text-white font-extrabold text-xs sm:text-sm">
                    VK
                  </div>
                  <div>
                    <div className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-1 sm:gap-1.5">
                      Vinay Cards
                      <span className="bg-emerald-500/20 text-emerald-400 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded">VERIFIED</span>
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-neutral-400">Dallas Card Show Table #42</div>
                  </div>
                </div>
                <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded">
                  Live
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#1C1C1E] p-2.5 sm:p-3 rounded-xl border border-white/5">
                  <div className="font-bold text-white text-[11px] sm:text-xs truncate">Messi Prizm WC</div>
                  <div className="text-[9px] sm:text-[10px] text-amber-400 font-bold mt-0.5">PSA 10 · Sports</div>
                  <div className="text-xs sm:text-sm font-extrabold text-white mt-1">$1,450.00</div>
                </div>
                <div className="bg-[#1C1C1E] p-2.5 sm:p-3 rounded-xl border border-white/5">
                  <div className="font-bold text-white text-[11px] sm:text-xs truncate">Charizard 1st Ed</div>
                  <div className="text-[9px] sm:text-[10px] text-purple-400 font-bold mt-0.5">PSA 9 · TCG</div>
                  <div className="text-xs sm:text-sm font-extrabold text-white mt-1">$4,200.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real Time Market Movements */}
        <div className="mt-8 grid overflow-hidden rounded-2xl border border-white/10 bg-panel md:grid-cols-2">
          <div className="flex flex-col justify-center p-6 sm:p-8 md:p-12">
            <h3 className="text-xl sm:text-2xl font-black text-white">Real-Time Market Movements</h3>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-neutral-300">
              When Patrick Mahomes throws 3 TDs, his card prices react instantly. RSL Cards connects verified performance to your inventory, showing you exactly how your assets are trending in real-time.
            </p>
            <div className="mt-5 flex items-center gap-3 text-sm font-bold text-green-400">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Mahomes Prizm PSA 10 up 14%</span>
            </div>
          </div>
          <div className="relative min-h-[240px] sm:min-h-[280px] border-t border-white/10 bg-black md:border-l md:border-t-0 flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-sm rounded-xl border border-line bg-ink p-4 sm:p-6 shadow-2xl">
              <div className="flex items-center gap-3 sm:gap-4 border-b border-line pb-3 sm:pb-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-rslRed flex items-center justify-center text-white font-black text-base sm:text-xl">PM</div>
                <div>
                  <div className="font-black text-sm sm:text-base text-white">Patrick Mahomes</div>
                  <div className="text-xs sm:text-sm text-neutral-400">KC • QB</div>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-neutral-400">Market Trend (7d)</span>
                  <span className="font-bold text-green-400">+14.2%</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-neutral-400">Inventory Impact</span>
                  <span className="font-bold text-white">+$120.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 text-center">
          <a
            href="https://app.rslcards.com/login"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-rslRed px-8 py-4 text-base font-black text-white transition hover:bg-white hover:!text-black"
          >
            Be First to Use RSL Cards <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  )
}
