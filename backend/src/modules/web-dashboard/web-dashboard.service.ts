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
        image_url: item.photos?.[0] || '/placeholder.png', 
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
        comp_avg: Number(item.comp_avg || 0),
        comp_trend: Number(item.comp_trend || 0),
        lowest_active: Number(item.lowest_active || 0),
        highest_active: Number(item.highest_active || 0),
        lowest_sold: Number(item.lowest_sold || 0),
        highest_sold: Number(item.highest_sold || 0),
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
        image_url: item.photos?.[0] || '/placeholder.png',
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
        comp_avg: Number(item.comp_avg || 0),
        comp_trend: Number(item.comp_trend || 0),
        lowest_active: Number(item.lowest_active || 0),
        highest_active: Number(item.highest_active || 0),
        lowest_sold: Number(item.lowest_sold || 0),
        highest_sold: Number(item.highest_sold || 0),
      },
      activeListings: activeListings.map(l => ({
        platform: l.platform,
        platform_listing_id: l.platform_listing_id,
        listingId: l.platform_listing_id,
        status: l.status,
        price: Number(l.list_price),
        createdAt: l.created_at,
        title: l.title,
        image_url: l.image_url,
        item_web_url: l.item_web_url
      })),
      soldComps: soldComps.map(c => ({
        platform: c.platform,
        platform_listing_id: c.platform_listing_id,
        title: c.title,
        price: Number(c.sold_price),
        soldAt: c.sold_at
      }))
    };
  }

  async getTopMovers(userId: string) {
    return this.repository.getTopMovers(userId);
  }

  async getAiInsights(userId: string) {
    return this.repository.getAiInsights(userId);
  }

  async getAffectedInventory(userId: string, playerName: string) {
    if (!playerName) return [];
    return this.repository.getAffectedInventory(userId, playerName);
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

  async getListings(userId: string) {
    const rawListings = await this.repository.getListings(userId);
    
    return rawListings.map(l => {
      // Reconstruct card title
      const titleParts = [];
      if (l.year) titleParts.push(l.year);
      if (l.playerName) titleParts.push(l.playerName);
      if (l.setName) titleParts.push(l.setName);
      if (l.variation) titleParts.push(l.variation);
      if (l.gradeKey && l.gradeKey !== 'RAW') {
        titleParts.push(l.gradeKey.replace('_', ' '));
      }
      
      const cardTitle = titleParts.join(' ');
      
      // Calculate days listed
      let daysListed = 0;
      if (l.listedAt) {
        const diffTime = Math.abs(new Date().getTime() - l.listedAt.getTime());
        daysListed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      }
      
      return {
        id: l.id,
        card: cardTitle,
        platform: l.platform.charAt(0).toUpperCase() + l.platform.slice(1),
        price: Number(l.listPrice),
        views: l.views,
        watchers: l.watchers,
        offers: l.offers,
        daysListed,
        status: (l.status || 'draft').charAt(0).toUpperCase() + (l.status || 'draft').slice(1),
        net: Number(l.netToDealer || l.listPrice),
        scheduleAt: l.scheduledAt?.toISOString(),
      };
    });
  }

  async updateListingStatus(userId: string, listingId: string, status: string) {
    return this.repository.updateListingStatus(userId, listingId, status);
  }

  async getReportData(userId: string, fromDate: string, toDate: string) {
    const data = await this.repository.getReportData(userId, fromDate, toDate);
    
    // Convert numerical fields to number for frontend
    const revenueData = data.revenueData.map((row: any) => ({
      date: row.date,
      isoDate: row.isoDate,
      revenue: Number(row.revenue),
      profit: Number(row.profit),
      cardsSold: Number(row.cards_sold)
    }));

    const platformColors: Record<string, string> = {
      'card shows': '#3B82F6',
      'ebay': '#60A5FA',
      'whatnot': '#93C5FD',
      'tcgplayer': '#BFDBFE',
      'other': '#D1D5DB'
    };

    const platformSales = data.platformSales.map((row: any) => {
      const p = (row.platform || 'other').toLowerCase();
      let displayName = p;
      if (p === 'ebay') displayName = 'eBay';
      else if (p === 'tcgplayer') displayName = 'TCGPlayer';
      else displayName = p.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

      return {
        platform: displayName,
        revenue: Number(row.revenue),
        profit: Number(row.profit),
        color: platformColors[p] || '#D1D5DB'
      };
    });

    // Group inventory stats for Margin Analysis & Aging
    const groupedMargins: any = { sport: {}, year: {}, grade: {} };
    const groupedAging: any = {
      '0-14 days': { name: '0-14 days', cards: 0, cost: 0, value: 0, totalDays: 0 },
      '15-30 days': { name: '15-30 days', cards: 0, cost: 0, value: 0, totalDays: 0 },
      '31-60 days': { name: '31-60 days', cards: 0, cost: 0, value: 0, totalDays: 0 },
      '60+ days': { name: '60+ days', cards: 0, cost: 0, value: 0, totalDays: 0 },
    };

    let agingAlerts = 0;

    data.inventoryStats.forEach((row: any) => {
      const sport = row.sport || 'Unknown';
      const year = row.year || 'Unknown';
      let grade = row.grade || 'RAW';
      grade = grade.replace('_', ' ');

      const daysHeld = Number(row.days_held || 0);
      const value = Number(row.value || 0);
      const cost = Number(row.cost || 0);

      if (daysHeld > 60) agingAlerts++;

      // Aggregate Margins
      [
        { key: 'sport', val: sport },
        { key: 'year', val: year },
        { key: 'grade', val: grade }
      ].forEach(({ key, val }) => {
        groupedMargins[key][val] ??= { cost: 0, value: 0, cards: 0 };
        groupedMargins[key][val].cost += cost;
        groupedMargins[key][val].value += value;
        groupedMargins[key][val].cards += 1;
      });

      // Aggregate Aging
      let band = '0-14 days';
      if (daysHeld > 14 && daysHeld <= 30) band = '15-30 days';
      else if (daysHeld > 30 && daysHeld <= 60) band = '31-60 days';
      else if (daysHeld > 60) band = '60+ days';

      groupedAging[band].cards += 1;
      groupedAging[band].cost += cost;
      groupedAging[band].value += value;
      groupedAging[band].totalDays += daysHeld;
    });

    const formatGroup = (groupObj: any) => Object.entries(groupObj).map(([name, stats]: [string, any]) => {
      const profit = stats.value - stats.cost;
      return {
        name,
        cards: stats.cards,
        profit,
        value: stats.value,
        margin: stats.value ? (profit / stats.value) * 100 : 0
      };
    }).sort((a, b) => b.profit - a.profit);

    const marginData = {
      sport: formatGroup(groupedMargins.sport),
      year: formatGroup(groupedMargins.year),
      grade: formatGroup(groupedMargins.grade),
      platform: platformSales.map(p => ({
        name: p.platform,
        cards: 1, // Approximation unless we query transactions
        profit: p.profit,
        value: p.revenue,
        margin: p.revenue ? (p.profit / p.revenue) * 100 : 0
      })).sort((a, b) => b.margin - a.margin)
    };

    const agingData = Object.values(groupedAging).map((stats: any) => {
      const profit = stats.value - stats.cost;
      return {
        name: stats.name,
        cards: stats.cards,
        profit,
        value: stats.value,
        margin: stats.value ? (profit / stats.value) * 100 : 0,
        avgDays: stats.cards ? Math.round(stats.totalDays / stats.cards) : 0
      };
    });

    const oldestCards = data.oldestCards.map((row: any) => ({
      id: row.id,
      player_name: row.player_name,
      year: row.year,
      set_name: row.set_name,
      grade_key: row.grade_key,
      image_url: row.image_url,
      days_held: Number(row.days_held),
      market_value: Number(row.market_value),
      cost_basis: Number(row.cost_basis),
      unrealized_gain: Number(row.unrealized_gain || 0),
      status: row.status || 'unlisted'
    }));

    // Get AI Insights directly
    const aiInsights = await this.getAiInsights(userId);

    return {
      revenueData,
      salesByPlatform: platformSales,
      marginData,
      agingData,
      oldestCards,
      agingAlerts,
      aiInsights
    };
  }

  async getCompHistory(insightId: string) {
    if (!insightId) return [];
    return this.repository.getCompHistory(insightId);
  }

  async getSportProfitMix(userId: string) {
    return this.repository.getSportProfitMix(userId);
  }
}
