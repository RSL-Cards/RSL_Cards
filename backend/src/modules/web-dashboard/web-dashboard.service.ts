import { WebDashboardRepository } from "./web-dashboard.repository.js";
import { TOP_MOVERS, AI_INSIGHTS } from "./mockData.js";

export class WebDashboardService {
  constructor(private readonly repository: WebDashboardRepository) {}

  async getMetrics(userId: string) {
    const {
      todayTx,
      todayBuys,
      yesterdayTx,
      weekTx,
      weekBuys,
      monthTx,
      monthBuys,
      activeInvStats
    } = await this.repository.getMetrics(userId);

    const t = todayTx;
    const tb = todayBuys;
    const yt = yesterdayTx;
    const w = weekTx;
    const wb = weekBuys;
    const m = monthTx;
    const mb = monthBuys;
    const inv = activeInvStats;

    const calculatePctChange = (current: number, previous: number) => {
      if (!previous) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      today: {
        revenue: t.revenue || 0,
        profit: t.profit || 0,
        margin: t.revenue ? ((t.profit || 0) / t.revenue) * 100 : 0,
        revenue_change: calculatePctChange(t.revenue || 0, yt.revenue || 0),
        profit_change: calculatePctChange(t.profit || 0, yt.profit || 0),
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

  async getInventory(userId: string, page: number = 1, limit: number = 20, search?: string) {
    const { items, total } = await this.repository.getInventory(userId, page, limit, search);
    
    const formattedItems = items.map((item: any) => {
      const daysHeld = Math.floor((Date.now() - new Date(item.added_at || new Date()).getTime()) / (1000 * 60 * 60 * 24));
      const cost = Number(item.cost_basis || 0);
      const gain = Number(item.unrealized_gain || 0);
      const pct = cost > 0 ? (gain / cost) * 100 : 0;
      
      return {
        id: item.id,
        image_url: item.photos?.[0] || '/patrick.webp', 
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

    return {
      items: formattedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getInventoryCounts(userId: string) {
    const counts = await this.repository.getInventoryCounts(userId);
    return {
      totalCards: Number(counts.total || 0),
      listedCards: Number(counts.listed || 0),
      unlistedCards: Number(counts.unlisted || 0)
    };
  }

  async getInventoryItemDetails(userId: string, inventoryId: string) {
    const data = await this.repository.getInventoryItemDetails(userId, inventoryId);
    if (!data) return null;

    const { item, activeListings, soldComps } = data;
    const cost = Number(item.cost_basis || 0);
    const gain = Number(item.unrealized_gain || 0);
    const daysHeld = Math.floor((Date.now() - new Date(item.added_at || new Date()).getTime()) / (1000 * 60 * 60 * 24));

    return {
      item: {
        id: item.id,
        image_url: item.photos?.[0] || '/patrick.webp',
        player_name: item.player_name || 'Unknown',
        year: item.year || new Date().getFullYear(),
        set_name: item.set_name || 'Unknown',
        grade_key: item.grade_key || 'RAW',
        sport: item.sport || 'Unknown',
        cost_basis: cost,
        market_value: Number(item.market_value || cost),
        unrealized_gain: gain,
        unrealized_gain_pct: cost > 0 ? (gain / cost) * 100 : 0,
        status: item.status,
        days_held: daysHeld,
        platforms_listed: item.platforms_listed || [],
      },
      activeListings: activeListings.map(l => ({
        platform: l.platform,
        listingId: l.platform_listing_id,
        status: l.status,
        price: Number(l.list_price),
        createdAt: l.created_at
      })),
      soldComps: soldComps.map(c => ({
        platform: c.platform,
        title: c.title,
        price: Number(c.sold_price),
        soldAt: c.sold_at
      }))
    };
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

  async getPassbookTransactions(userId: string) {
    const rawTx = await this.repository.getPassbookTransactions(userId);
    let runningBalance = 0;
    
    // rawTx is ordered by date ASC from the repository
    return rawTx.map((tx: any) => {
      const type = tx.type || 'buy';
      const price = Number(tx.price || 0);
      let debit = 0;
      let credit = 0;
      
      if (type === 'buy') {
        debit = price;
        runningBalance -= price;
      } else if (type === 'sell') {
        credit = price;
        runningBalance += price;
      }
      // trade might not affect cash balance directly, or depends on cashAdjustment

      const profit = tx.profit ? Number(tx.profit) : null;
      const margin = (profit !== null && Number(tx.cost_basis) > 0) 
        ? (profit / Number(tx.cost_basis)) * 100 
        : null;

      const dateObj = new Date(tx.created_at || new Date());
      
      return {
        id: tx.id,
        date: dateObj.toISOString().slice(0, 10),
        time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reference: tx.id.slice(0, 8).toUpperCase(),
        type,
        card: tx.player_name || 'Unknown',
        customer: tx.customer_name || 'Direct',
        grade: String(tx.grade_key || 'RAW').replace('_', ' '),
        channel: tx.channel || 'Direct',
        payment: tx.payment_method || 'Other',
        debit,
        credit,
        profit,
        margin: margin ? Number(margin.toFixed(2)) : null,
        balance: runningBalance
      };
    }).reverse(); // UI usually shows latest on top, so reverse after running balance calculation
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
