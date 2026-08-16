import {
  AgingReportItem,
  DateRange,
  MarginReportItem,
  PlatformSales,
  ReportPeriod,
} from './reportsTypes'

export const getLocalYMD = (d = new Date()) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const periodDateRanges: Record<Exclude<ReportPeriod, 'Custom'>, DateRange> = {
  Daily: { from: getLocalYMD(), to: getLocalYMD() },
  Weekly: { from: getLocalYMD(new Date(Date.now() - 7*24*60*60*1000)), to: getLocalYMD() },
  Monthly: { from: getLocalYMD(new Date(Date.now() - 30*24*60*60*1000)), to: getLocalYMD() },
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
    ["═══════════════════════════════════════════════════════"],
    ["                        RSL CARDS                      "],
    ["               Elevating Your Card Business            "],
    ["═══════════════════════════════════════════════════════"],
    [],
    ['REPORT:', `${period} Report`],
    ['FROM:', dateRange.from],
    ['TO:', dateRange.to],
    [],
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

export const exportPdf = async ({
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
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text('RSL CARDS', 14, 20)
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text('Elevating Your Card Business', 14, 26)

  doc.setFontSize(14)
  doc.setTextColor(0)
  doc.text(`${period} Report`, 14, 38)
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`${dateRange.from} to ${dateRange.to}`, 14, 44)

  doc.setFontSize(12)
  doc.setTextColor(0)
  doc.text(`Total Revenue: ${formatDollars(totalRevenue)}`, 14, 56)
  doc.text(`Total Profit: ${formatDollars(totalProfit)}`, 14, 64)
  doc.text(`Margin: ${margin.toFixed(1)}%`, 14, 72)
  doc.text(`Cards Sold: ${cardsSold}`, 14, 80)

  doc.setFontSize(10)
  doc.setTextColor(50)
  doc.text(
    `${bestPlatform.platform} led platform sales. ${bestMarginGroup.name} was the strongest margin segment.`,
    14,
    92
  )
  doc.text(`${agingAlerts} cards are currently held over 60 days.`, 14, 98)

  autoTable(doc, {
    startY: 108,
    head: [['Platform', 'Revenue', 'Profit']],
    body: salesByPlatform.map((item) => [
      item.platform,
      formatDollars(item.revenue),
      formatDollars(item.profit),
    ]),
    headStyles: { fillColor: [0, 87, 255] },
  })

  doc.save(`rsl-${period.toLowerCase()}-report-${dateRange.from}-to-${dateRange.to}.pdf`)
}
