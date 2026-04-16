import Shell from '@/components/layout/Shell'
import MetricCard from '@/components/dashboard/MetricCard'
import RevenueChart from '@/components/dashboard/RevenueChart'
import ProfitByChannelChart from '@/components/dashboard/ProfitByChannelChart'
import PortfolioHealth from '@/components/dashboard/PortfolioHealth'
import MarketMovers from '@/components/dashboard/MarketMovers'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import AIInsightsPreview from '@/components/dashboard/AIInsightsPreview'
import { 
  METRICS, 
  REVENUE_CHART_DATA, 
  CHANNEL_DATA, 
  INVENTORY_TABLE_DATA, 
  TOP_MOVERS, 
  RECENT_TRANSACTIONS,
  AI_INSIGHTS 
} from '@/data/mockDashboard'

export default function DashboardPage() {
  // Calculate portfolio health metrics
  const totalCards = INVENTORY_TABLE_DATA.length
  const listedCards = INVENTORY_TABLE_DATA.filter(card => card.status === 'listed').length
  const unlistedCards = totalCards - listedCards
  const gainingValue = INVENTORY_TABLE_DATA.filter(card => card.unrealized_gain > 0).length
  const losingValue = INVENTORY_TABLE_DATA.filter(card => card.unrealized_gain < 0).length
  const agingAlerts = INVENTORY_TABLE_DATA.filter(card => card.days_held > 60).length
  
  const agingCards = INVENTORY_TABLE_DATA
    .filter(card => card.days_held > 60)
    .map(card => ({
      player: card.player_name,
      grade: card.grade_key.replace('_', ' '),
      daysHeld: card.days_held,
      change: card.unrealized_gain_pct
    }))

  // Generate sparkline data for metric cards
  const generateSparklineData = (baseValue: number, variance: number) => {
    return Array.from({ length: 7 }, () => 
      baseValue + (Math.random() - 0.5) * variance
    )
  }

  return (
    <Shell>
      <div className="space-y-6">
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Today's Revenue"
            value={METRICS.today.revenue}
            trend={{ value: 14.2, label: 'vs yesterday' }}
            sparklineData={generateSparklineData(METRICS.today.revenue, 200)}
            format="currency"
            color="blue"
          />
          <MetricCard
            title="Today's Profit"
            value={METRICS.today.profit}
            trend={{ value: 8.4, label: 'vs yesterday' }}
            subtitle={`${METRICS.today.margin.toFixed(1)}% margin`}
            sparklineData={generateSparklineData(METRICS.today.profit, 50)}
            format="currency"
            color="green"
          />
          <MetricCard
            title="Portfolio Value"
            value={METRICS.total_inventory_value}
            trend={{ value: METRICS.unrealized_gain_pct }}
            subtitle={`+$${METRICS.unrealized_gain.toLocaleString()} unrealized gain`}
            sparklineData={generateSparklineData(METRICS.total_inventory_value, 1000)}
            format="currency"
            color="blue"
          />
          <MetricCard
            title="Cards Sold Today"
            value={METRICS.today.cards_sold}
            subtitle={`${METRICS.today.cards_bought} bought, net ${METRICS.today.cards_sold - METRICS.today.cards_bought} card`}
            format="number"
            color="default"
          />
        </div>

        {/* Main Chart + Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart data={REVENUE_CHART_DATA} />
          </div>
          <div>
            <ProfitByChannelChart data={CHANNEL_DATA} />
          </div>
        </div>

        {/* Portfolio Health + Market Movers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortfolioHealth
            totalCards={totalCards}
            listedCards={listedCards}
            unlistedCards={unlistedCards}
            gainingValue={gainingValue}
            losingValue={losingValue}
            agingAlerts={agingAlerts}
            totalCost={METRICS.total_cost_basis}
            totalValue={METRICS.total_inventory_value}
            totalGain={METRICS.unrealized_gain}
            totalGainPct={METRICS.unrealized_gain_pct}
            agingCards={agingCards}
          />
          <MarketMovers movers={TOP_MOVERS} />
        </div>

        {/* Recent Transactions */}
        <RecentTransactions transactions={RECENT_TRANSACTIONS} />

        {/* AI Insights Preview */}
        <AIInsightsPreview insights={AI_INSIGHTS} />
      </div>
    </Shell>
  )
}
