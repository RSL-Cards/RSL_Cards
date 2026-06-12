import {
  BriefcaseBusiness,
  Check,
  Database,
  FileSpreadsheet,
  Handshake,
  Layers,
  ScanLine,
  ShoppingBag,
  Users,
  WifiOff,
} from 'lucide-react'

const deepFeatures = [
  {
    icon: ScanLine,
    title: 'BUY Flow',
    kicker: '8-10 seconds from scan to done',
    text: 'Scan a raw card or graded slab, see comps, choose your buy price, record the payment method, and add the card to inventory with cost basis already attached.',
    bullets: ['Camera scan and slab barcode scan', 'Deal rating before you buy', 'Cash, Venmo, Zelle, PayPal, and Cash App notes'],
  },
  {
    icon: ShoppingBag,
    title: 'SELL Flow',
    kicker: 'Instant profit calculation',
    text: 'Select a card from inventory, review cost basis and market value, enter the sale price, and generate a QR payment code while the buyer is still at your table.',
    bullets: ['Real-time margin calculation', 'QR payment code support', 'Inventory updates as soon as the deal closes'],
  },
  {
    icon: Database,
    title: 'Inventory',
    kicker: 'Full cost basis tracking',
    text: 'Know every card you own, what you paid, where it came from, what it is worth, and how long it has been sitting in your case.',
    bullets: ['Aging inventory visibility', 'Market value updates', 'Purchase source and notes'],
  },
  {
    icon: WifiOff,
    title: 'Offline Mode',
    kicker: 'Works with zero signal',
    text: 'Card shows are noisy, packed, and usually terrible for WiFi. RSL Cards Pro keeps the core dealer workflow available even when your phone has no connection.',
    bullets: ['Offline search and cached comps', 'Local transaction queue', 'Auto-sync when signal returns'],
  },
  {
    icon: Layers,
    title: 'Multi-Deal Tabs',
    kicker: 'Keep several deals open',
    text: 'Handle multiple buyers and trade conversations without losing your place. Keep one deal open, price another, then jump back when the buyer returns.',
    bullets: ['Separate active deal tabs', 'Saved scan context', 'Faster show-floor switching'],
  },
  {
    icon: Handshake,
    title: 'Trade Tracking',
    kicker: 'Cards given vs cards received',
    text: 'Value both sides of a trade, record cash added, and keep the resulting cost basis clean so your reports still make sense later.',
    bullets: ['Auto-valued trade sides', 'Cash difference tracking', 'Cost basis allocation'],
  },
  {
    icon: BriefcaseBusiness,
    title: 'Consignment',
    kicker: 'Track cards sold for others',
    text: 'Separate your owned inventory from consigned cards, record payout terms, and keep each seller relationship clean.',
    bullets: ['Owner records', 'Commission and payout notes', 'Consignment sale history'],
  },
  {
    icon: FileSpreadsheet,
    title: 'Reports & Tax Tools',
    kicker: 'Daily, weekly, monthly profit',
    text: 'Stop reconstructing your business from memory. See revenue, cost basis, fees, expenses, net profit, and exports built for tax season.',
    bullets: ['Daily show reports', 'Schedule C-ready export structure', 'Expense log and 1099 tracking'],
  },
  {
    icon: Users,
    title: 'Customer Database',
    kicker: 'Know your regulars',
    text: 'Track repeat buyers, their preferences, deal history, and cards they are hunting so every show starts warmer than the last.',
    bullets: ['Customer history', 'Want list notes', 'Follow-up reminders'],
  },
]

export default function DealerFeatures() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-rslRed">Dealer tools</p>
        <h2 className="display-title mt-4 text-3xl leading-tight md:text-5xl">
          Everything your table needs, before, during, and after the show.
        </h2>
        <p className="mt-5 text-lg leading-8 text-neutral-300">
          Each workflow is designed around the way card show dealers move: fast scans, fast
          decisions, messy payments, multiple conversations, and inventory that still needs to be
          accurate when the doors close.
        </p>
      </div>
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {deepFeatures.map((feature) => {
          const Icon = feature.icon
          return (
            <article key={feature.title} className="border border-line bg-panel p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-rslRed">
                    {feature.kicker}
                  </p>
                  <h3 className="mt-3 text-2xl font-bold">{feature.title}</h3>
                </div>
                <Icon className="h-7 w-7 shrink-0 text-rslRed" />
              </div>
              <p className="mt-5 leading-7 text-neutral-300">{feature.text}</p>
              <ul className="mt-5 space-y-3">
                {feature.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-sm text-neutral-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-rslRed" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </article>
          )
        })}
      </div>
    </section>
  )
}
