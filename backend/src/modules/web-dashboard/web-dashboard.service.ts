import { WebDashboardRepository } from "./web-dashboard.repository.js";
import { TOP_MOVERS, AI_INSIGHTS } from "./mockData.js";

export class WebDashboardService {
  constructor(private readonly repository: WebDashboardRepository) {}

  async getMetrics(userId: string) {
    const {
      todayTx,
      todayBuys,
      weekTx,
      weekBuys,
      monthTx,
      monthBuys,
      activeInvStats
    } = await this.repository.getMetrics(userId);

    const t = todayTx;
    const tb = todayBuys;
    const w = weekTx;
    const wb = weekBuys;
    const m = monthTx;
    const mb = monthBuys;
    const inv = activeInvStats;

    return {
      today: {
        revenue: t.revenue || 0,
        profit: t.profit || 0,
        margin: t.revenue ? ((t.profit || 0) / t.revenue) * 100 : 0,
        cards_bought: tb.cards_bought || 0,
        cards_sold: t.cards_sold || 0,
        total_spent: tb.total_spent || 0,
      },
      week: {
        revenue: w.revenue || 0,
        profit: w.profit || 0,
        margin: w.revenue ? ((w.profit || 0) / w.revenue) * 100 : 0,
        cards_bought: wb.cards_bought || 0,
        cards_sold: w.cards_sold || 0,
        revenue_change: 0, 
      },
      month: {
        revenue: m.revenue || 0,
        profit: m.profit || 0,
        margin: m.revenue ? ((m.profit || 0) / m.revenue) * 100 : 0,
        cards_bought: mb.cards_bought || 0,
        cards_sold: m.cards_sold || 0,
        revenue_change: 0,
      },
      total_inventory_value: inv.total_market_value || 0,
      total_cost_basis: inv.total_cost_basis || 0,
      unrealized_gain: inv.unrealized_gain || 0,
      unrealized_gain_pct: inv.total_cost_basis ? ((inv.unrealized_gain || 0) / inv.total_cost_basis) * 100 : 0,
    };
  }

  async getRevenueChart(userId: string) {
    const rows = await this.repository.getRevenueChart(userId);
    return rows.map(row => ({
      date: row.date_label,
      revenue: Number(row.revenue),
      profit: Number(row.profit)
    }));
  }

  async getChannelData(userId: string) {
    const rows = await this.repository.getChannelData(userId);
    const colorMap: Record<string, string> = {
      'card_show': '#3B82F6',
      'ebay': '#60A5FA',
      'whatnot': '#93C5FD',
      'tcgplayer': '#BFDBFE',
      'other': '#D1D5DB'
    };

    return rows.map(row => {
      const channelLabel = String(row.channel).replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      return {
        channel: channelLabel,
        revenue: Number(row.revenue),
        profit: Number(row.profit),
        pct: Number(row.pct),
        color: colorMap[String(row.channel)] || colorMap['other']
      };
    });
  }

  async getInventory(userId: string) {
    const items = await this.repository.getInventory(userId);
    
    return items.map((item: any) => {
      const daysHeld = Math.floor((Date.now() - new Date(item.added_at).getTime()) / (1000 * 60 * 60 * 24));
      const cost = Number(item.cost_basis || 0);
      const gain = Number(item.unrealized_gain || 0);
      const pct = cost > 0 ? (gain / cost) * 100 : 0;
      
      return {
        id: item.id,
        image_url: '/patrick.webp', 
        player_name: item.player_name || 'Unknown',
        year: item.year || new Date().getFullYear(),
        set_name: item.set_name || 'Unknown',
        grade_key: item.grade_key || 'RAW',
        sport: item.sport || 'Unknown',
        cost_basis: cost,
        market_value: Number(item.market_value || cost),
        unrealized_gain: gain,
        unrealized_gain_pct: pct,
        status: item.status,
        days_held: daysHeld,
        comp_avg: Number(item.market_value || 0),
        comp_trend: 0,
        platforms_listed: item.platforms_listed || [],
      };
    });
  }

  getTopMovers() {
    return TOP_MOVERS;
  }

  getAiInsights() {
    return AI_INSIGHTS;
  }

  async getRecentTransactions(userId: string) {
    const recent = await this.repository.getRecentTransactions(userId);
    return recent.map(tx => ({
      id: tx.id,
      type: tx.type,
      player: tx.playerName || 'Unknown',
      grade: tx.gradeKey?.replace('_', ' ') || 'RAW',
      price: Number(tx.price),
      profit: tx.profit ? Number(tx.profit) : null,
      margin: tx.profitPct ? Number(tx.profitPct) : null,
      channel: tx.channel || 'Direct',
      payment: tx.paymentMethod || 'Other',
      time: new Date(tx.createdAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
  }

  async getPortfolioSnapshot(userId: string) {
    const { snapshotRow, agingCardsRows } = await this.repository.getPortfolioSnapshot(userId);

    return {
      totalCards: Number(snapshotRow.total_cards || 0),
      listedCards: Number(snapshotRow.listed_cards || 0),
      unlistedCards: Number(snapshotRow.unlisted_cards || 0),
      gainingValue: Number(snapshotRow.gaining_value || 0),
      losingValue: Number(snapshotRow.losing_value || 0),
      agingAlerts: Number(snapshotRow.aging_alerts || 0),
      agingCards: agingCardsRows.map(r => ({
        player: r.player || 'Unknown',
        grade: String(r.grade || 'RAW').replace('_', ' '),
        daysHeld: Number(r.daysHeld || 0),
        change: Number(r.change || 0)
      }))
    };
  }
}
