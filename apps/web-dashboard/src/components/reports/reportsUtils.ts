import { formatGrade, InventoryCard } from '@/components/inventory/inventoryUtils'
import {
  CHANNEL_DATA,
  INVENTORY_TABLE_DATA,
  RECENT_TRANSACTIONS,
} from '@/data/mockDashboard'
import {
  AgingReportItem,
  DateRange,
  MarginDimension,
  MarginReportItem,
  NormalizedRevenuePoint,
  PlatformSales,
  ReportPeriod,
} from './reportsTypes'

const reportYear = 2026
const periodDateRanges: Record<Exclude<ReportPeriod, 'Custom'>, DateRange> = {
  Daily: { from: '2026-04-15', to: '2026-04-15' },
  Weekly: { from: '2026-04-09', to: '2026-04-15' },
  Monthly: { from: '2026-04-01', to: '2026-04-30' },
}

export const marginLabels: Record<MarginDimension, string> = {
  sport: 'Sport',
  year: 'Year',
  grade: 'Grade',
  platform: 'Platform',
}

export const chartColors = ['#0057FF', '#E8001C', '#00C853', '#FFB300', '#7B2FFF', '#00BCD4']

export const getPeriodDates = (period: ReportPeriod, currentRange?: DateRange): DateRange => {
  if (period === 'Custom') return currentRange ?? periodDateRanges.Monthly
  return periodDateRanges[period]
}

export const normalizeRevenueData = (
  data: Array<{ date: string; revenue: number; profit: number }>
): NormalizedRevenuePoint[] =>
  data.map((item) => {
    const [, day] = item.date.split(' ')
    const isoDate = `${reportYear}-04-${day.padStart(2, '0')}`
    return { ...item, isoDate }
  })

const getAgingBand = (daysHeld: number) => {
  if (daysHeld <= 14) return '0-14 days'
  if (daysHeld <= 30) return '15-30 days'
  if (daysHeld <= 60) return '31-60 days'
  return '60+ days'
}

const aggregateCards = (
  cards: InventoryCard[],
  getKey: (card: InventoryCard) => string
): MarginReportItem[] => {
  const grouped = cards.reduce<Record<string, { cost: number; value: number; cards: number }>>(
    (acc, card) => {
      const key = getKey(card)
      acc[key] ??= { cost: 0, value: 0, cards: 0 }
      acc[key].cost += card.cost_basis
      acc[key].value += card.market_value
      acc[key].cards += 1
      return acc
    },
    {}
  )

  return Object.entries(grouped)
    .map(([name, item]) => {
      const profit = item.value - item.cost
      return {
        name,
        cards: item.cards,
        profit,
        value: item.value,
        margin: item.value ? (profit / item.value) * 100 : 0,
      }
    })
    .sort((a, b) => b.profit - a.profit)
}

export const getSalesByPlatform = (revenueData: NormalizedRevenuePoint[]): PlatformSales[] => {
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalProfit = revenueData.reduce((sum, item) => sum + item.profit, 0)
  const channelRevenueTotal = CHANNEL_DATA.reduce((sum, item) => sum + item.revenue, 0)
  const channelProfitTotal = CHANNEL_DATA.reduce((sum, item) => sum + item.profit, 0)

  return CHANNEL_DATA.map((channel) => ({
    platform: channel.channel,
    revenue: Math.round(totalRevenue * (channel.revenue / channelRevenueTotal)),
    profit: Math.round(totalProfit * (channel.profit / channelProfitTotal)),
    color: channel.color,
  }))
}

export const getMarginData = (
  marginDimension: MarginDimension,
  salesByPlatform: PlatformSales[]
): MarginReportItem[] => {
  if (marginDimension === 'platform') {
    return salesByPlatform
      .map((platform) => ({
        name: platform.platform,
        cards: RECENT_TRANSACTIONS.filter((tx) => tx.channel === platform.platform).length || 1,
        profit: platform.profit,
        value: platform.revenue,
        margin: platform.revenue ? (platform.profit / platform.revenue) * 100 : 0,
      }))
      .sort((a, b) => b.margin - a.margin)
  }

  const selectors: Record<Exclude<MarginDimension, 'platform'>, (card: InventoryCard) => string> = {
    sport: (card) => card.sport,
    year: (card) => String(card.year),
    grade: (card) => formatGrade(card.grade_key),
  }

  return aggregateCards(INVENTORY_TABLE_DATA, selectors[marginDimension])
}

export const getAgingReport = (cards: InventoryCard[]): AgingReportItem[] => {
  const grouped = aggregateCards(cards, (card) => getAgingBand(card.days_held))
  const bandOrder = ['0-14 days', '15-30 days', '31-60 days', '60+ days']

  return grouped
    .map((item) => ({
      ...item,
      avgDays: Math.round(
        cards
          .filter((card) => getAgingBand(card.days_held) === item.name)
          .reduce((sum, card) => sum + card.days_held, 0) / item.cards
      ),
    }))
    .sort((a, b) => bandOrder.indexOf(a.name) - bandOrder.indexOf(b.name))
}

export const getOldestCards = (cards: InventoryCard[]) =>
  [...cards].sort((a, b) => b.days_held - a.days_held).slice(0, 4)

const csvEscape = (value: string | number) => {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const toCsv = (rows: Array<Array<string | number>>) =>
  rows.map((row) => row.map(csvEscape).join(',')).join('\n')

export const buildReportCsv = ({
  agingData,
  bestMarginGroup,
  bestPlatform,
  cardsSold,
  dateRange,
  margin,
  marginData,
  period,
  salesByPlatform,
  totalProfit,
  totalRevenue,
}: {
  agingData: AgingReportItem[]
  bestMarginGroup: MarginReportItem
  bestPlatform: PlatformSales
  cardsSold: number
  dateRange: DateRange
  margin: number
  marginData: MarginReportItem[]
  period: ReportPeriod
  salesByPlatform: PlatformSales[]
  totalProfit: number
  totalRevenue: number
}) =>
  toCsv([
    ['RSL Cards Report'],
    ['Period', period],
    ['From', dateRange.from],
    ['To', dateRange.to],
    ['Total Revenue', totalRevenue],
    ['Total Profit', totalProfit],
    ['Margin %', margin.toFixed(1)],
    ['Cards Sold', cardsSold],
    ['Top Platform', bestPlatform.platform],
    ['Best Margin Segment', bestMarginGroup.name],
    [],
    ['Sales by Platform'],
    ['Platform', 'Revenue', 'Profit'],
    ...salesByPlatform.map((item) => [item.platform, item.revenue, item.profit]),
    [],
    ['Profit Margin Analysis'],
    ['Segment', 'Cards', 'Value', 'Profit', 'Margin %'],
    ...marginData.map((item) => [
      item.name,
      item.cards,
      item.value,
      item.profit,
      item.margin.toFixed(1),
    ]),
    [],
    ['Inventory Aging'],
    ['Band', 'Cards', 'Value', 'Profit', 'Avg Days'],
    ...agingData.map((item) => [item.name, item.cards, item.value, item.profit, item.avgDays]),
  ])

export const exportCsv = (filename: string, csv: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const formatDollars = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

export const exportPdf = ({
  agingAlerts,
  bestMarginGroup,
  bestPlatform,
  cardsSold,
  dateRange,
  margin,
  period,
  salesByPlatform,
  totalProfit,
  totalRevenue,
}: {
  agingAlerts: number
  bestMarginGroup: MarginReportItem
  bestPlatform: PlatformSales
  cardsSold: number
  dateRange: DateRange
  margin: number
  period: ReportPeriod
  salesByPlatform: PlatformSales[]
  totalProfit: number
  totalRevenue: number
}) => {
  const reportWindow = window.open('', '_blank', 'width=960,height=720')
  if (!reportWindow) return

  const platformRows = salesByPlatform
    .map(
      (item) =>
        `<tr><td>${item.platform}</td><td>${formatDollars(item.revenue)}</td><td>${formatDollars(item.profit)}</td></tr>`
    )
    .join('')

  reportWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>RSL Cards ${period} Report</title>
        <style>
          body { color: #111; font-family: Arial, sans-serif; margin: 32px; }
          h1 { margin-bottom: 4px; }
          .muted { color: #555; }
          .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
          .metric { border: 1px solid #ddd; border-radius: 8px; padding: 14px; }
          .label { color: #555; font-size: 12px; text-transform: uppercase; }
          .value { font-size: 22px; font-weight: 700; margin-top: 6px; }
          table { border-collapse: collapse; width: 100%; margin-top: 12px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #f5f5f5; }
          @media print { button { display: none; } body { margin: 20mm; } }
        </style>
      </head>
      <body>
        <button onclick="window.print()">Save as PDF</button>
        <h1>RSL Cards ${period} Report</h1>
        <div class="muted">${dateRange.from} to ${dateRange.to}</div>
        <div class="metrics">
          <div class="metric"><div class="label">Revenue</div><div class="value">${formatDollars(totalRevenue)}</div></div>
          <div class="metric"><div class="label">Profit</div><div class="value">${formatDollars(totalProfit)}</div></div>
          <div class="metric"><div class="label">Margin</div><div class="value">${margin.toFixed(1)}%</div></div>
          <div class="metric"><div class="label">Cards Sold</div><div class="value">${cardsSold}</div></div>
        </div>
        <p>
          ${bestPlatform.platform} led platform sales. ${bestMarginGroup.name} was the strongest
          margin segment. ${agingAlerts} cards are currently held over 60 days.
        </p>
        <h2>Sales by Platform</h2>
        <table>
          <thead><tr><th>Platform</th><th>Revenue</th><th>Profit</th></tr></thead>
          <tbody>${platformRows}</tbody>
        </table>
        <script>
          window.onload = () => setTimeout(() => window.print(), 250)
        </script>
      </body>
    </html>
  `)
  reportWindow.document.close()
}
