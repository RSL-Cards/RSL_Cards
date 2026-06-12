import {
  Table2,
  ScanLine,
  Database,
  Bot,
  WifiOff,
  Layers,
  Check,
} from 'lucide-react'

const featureGroups = [
  {
    id: 'all',
    title: 'All Features',
    icon: Table2,
    text: 'A complete operating system across scanning, show-floor workflows, inventory, pricing intelligence, listing, and reporting.',
    items: ['Mobile scanning', 'Dealer BUY/SELL flow', 'Collector portfolio', 'AI explanations', 'Show finder', 'Reports'],
  },
  {
    id: 'dealers',
    title: 'Dealers',
    icon: ScanLine,
    text: 'Built for fast table work: scan, comp, buy, sell, record payment notes, and keep cost basis clean.',
    items: ['BUY/SELL flow', 'Profit tracking', 'Tax tools', 'Customer database', 'Consignment', 'Trade tracking'],
  },
  {
    id: 'collectors',
    title: 'Collectors',
    icon: Database,
    text: 'Free tools for collectors who want to scan cards, understand prices, and track a collection with context.',
    items: ['Collection tracker', 'Price alerts', 'Want list', 'Market movers', 'Deal rating', 'Card show finder'],
  },
  {
    id: 'ai-engine',
    title: 'AI Engine',
    icon: Bot,
    text: 'RSL Cards connects player performance, news, injuries, trades, social buzz, and sold comps into plain-English price explanations.',
    items: ['Trend explanations', 'Daily insight cards', 'Inventory impact', 'Market movement reasons'],
  },
  {
    id: 'offline',
    title: 'Offline Mode',
    icon: WifiOff,
    text: 'Core dealer workflows are designed for convention centers and card shows where signal is unreliable.',
    items: ['Offline search', 'Cached comps', 'Local transaction queue', 'Auto-sync'],
  },
  {
    id: 'multi-channel',
    title: 'Multi-Channel Listing',
    icon: Layers,
    text: 'List cards from one dashboard and compare platform economics before choosing where to sell.',
    items: ['eBay', 'Whatnot', 'Mercari', 'TCGPlayer', 'Shopify', 'Fee comparison'],
  },
]

export default function FeaturesGrid() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {featureGroups.map((group) => {
          const Icon = group.icon
          return (
            <article id={group.id} key={group.id} className="border border-line bg-panel p-6 scroll-mt-28">
              <Icon className="h-7 w-7 text-rslRed" />
              <h2 className="mt-5 text-2xl font-bold">{group.title}</h2>
              <p className="mt-3 leading-7 text-neutral-300">{group.text}</p>
              <ul className="mt-5 space-y-3">
                {group.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-neutral-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-rslRed" />
                    <span>{item}</span>
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
