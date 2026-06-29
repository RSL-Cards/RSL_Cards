import {
  AgingReportItem,
  DateRange,
  MarginReportItem,
  PlatformSales,
  ReportPeriod,
} from './reportsTypes'

const periodDateRanges: Record<Exclude<ReportPeriod, 'Custom'>, DateRange> = {
  Daily: { from: new Date().toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] },
  Weekly: { from: new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] },
  Monthly: { from: new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] },
}

export const marginLabels: Record<string, string> = {
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
