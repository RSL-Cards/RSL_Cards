import { ArrowRight, Layers, TrendingUp, DollarSign, PieChart } from 'lucide-react'

const features = [
  {
    title: 'Inventory & Operations',
    description: 'Organize cards, purchases, sales, and show activity in one place.',
    icon: Layers,
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
            RSL Cards is a connected system. From the mobile app in your pocket to the full dealer dashboard.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {features.map((feature, idx) => (
            <div key={idx} className="border border-white/10 bg-panel p-8 transition hover:border-white/20">
              <feature.icon className="h-8 w-8 text-rslRed" />
              <h3 className="mt-4 text-xl font-black text-white">{feature.title}</h3>
              <p className="mt-2 text-neutral-300">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid overflow-hidden rounded-2xl border border-white/10 bg-panel md:grid-cols-2">
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
            {/* Using a placeholder visual that implies the connection between player and card */}
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
            href="#coming-soon"
            className="inline-flex items-center gap-2 bg-rslRed px-8 py-4 text-base font-black transition hover:bg-white hover:text-black"
          >
            Be First to Use RSL Cards <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  )
}
