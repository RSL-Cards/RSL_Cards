import { db } from "../../db/index.js";
import { inventory, transactions, players } from "../../db/schema/index.js";
import { sql, eq, and, gte, desc, sum, count } from "drizzle-orm";

export class WebDashboardRepository {
  async getMetrics(userId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todayTx = await db
      .select({
        revenue: sum(transactions.price).mapWith(Number),
        profit: sum(transactions.profit).mapWith(Number),
        cards_sold: count(),
      })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.type, "sell"), gte(transactions.createdAt, today)));

    const todayBuys = await db
      .select({ cards_bought: count(), total_spent: sum(transactions.price).mapWith(Number) })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.type, "buy"), gte(transactions.createdAt, today)));

    const weekTx = await db
      .select({
        revenue: sum(transactions.price).mapWith(Number),
        profit: sum(transactions.profit).mapWith(Number),
        cards_sold: count(),
      })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.type, "sell"), gte(transactions.createdAt, weekAgo)));

    const weekBuys = await db
      .select({ cards_bought: count() })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.type, "buy"), gte(transactions.createdAt, weekAgo)));

    const monthTx = await db
      .select({
        revenue: sum(transactions.price).mapWith(Number),
        profit: sum(transactions.profit).mapWith(Number),
        cards_sold: count(),
      })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.type, "sell"), gte(transactions.createdAt, monthAgo)));

    const monthBuys = await db
      .select({ cards_bought: count() })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.type, "buy"), gte(transactions.createdAt, monthAgo)));

    const activeInvStats = await db
      .select({
        total_cost_basis: sum(inventory.costBasis).mapWith(Number),
        total_market_value: sum(inventory.currentMarketValue).mapWith(Number),
        unrealized_gain: sum(inventory.unrealizedGain).mapWith(Number),
      })
      .from(inventory)
      .where(sql`${inventory.userId} = ${userId} AND ${inventory.listingStatus} IN ('unlisted', 'listed')`);

    return {
      todayTx: todayTx[0] || { revenue: 0, profit: 0, cards_sold: 0 },
      todayBuys: todayBuys[0] || { cards_bought: 0, total_spent: 0 },
      weekTx: weekTx[0] || { revenue: 0, profit: 0, cards_sold: 0 },
      weekBuys: weekBuys[0] || { cards_bought: 0 },
      monthTx: monthTx[0] || { revenue: 0, profit: 0, cards_sold: 0 },
      monthBuys: monthBuys[0] || { cards_bought: 0 },
      activeInvStats: activeInvStats[0] || { total_cost_basis: 0, total_market_value: 0, unrealized_gain: 0 }
    };
  }

  async getRevenueChart(userId: string) {
    const result = await db.execute(sql`
      WITH dates AS (
        SELECT generate_series(
          current_date - interval '13 days',
          current_date,
          '1 day'::interval
        )::date as date
      )
      SELECT 
        to_char(d.date, 'Mon FMDD') as date_label,
        COALESCE(SUM(t.price), 0) as revenue,
        COALESCE(SUM(t.profit), 0) as profit
      FROM dates d
      LEFT JOIN transactions t 
        ON DATE(t.created_at) = d.date 
        AND t.user_id = ${userId}
        AND t.type = 'sell'
      GROUP BY d.date, date_label
      ORDER BY d.date ASC
    `);
    return result.rows;
  }

  async getChannelData(userId: string) {
    const result = await db.execute(sql`
      WITH channel_sums AS (
        SELECT 
          channel,
          COALESCE(SUM(price), 0) as revenue,
          COALESCE(SUM(profit), 0) as profit
        FROM transactions
        WHERE user_id = ${userId} AND type = 'sell'
        GROUP BY channel
      ),
      total_revenue AS (
        SELECT COALESCE(SUM(revenue), 1) as total FROM channel_sums
      )
      SELECT 
        c.channel,
        c.revenue,
        c.profit,
        (c.revenue / t.total * 100) as pct
      FROM channel_sums c
      CROSS JOIN total_revenue t
      ORDER BY c.revenue DESC
    `);
    return result.rows;
  }

  async getInventory(userId: string) {
    return await db
      .select({
        id: inventory.id,
        year: inventory.year,
        set_name: inventory.setName,
        grade_key: inventory.gradeKey,
        sport: inventory.sport,
        cost_basis: inventory.costBasis,
        market_value: inventory.currentMarketValue,
        unrealized_gain: inventory.unrealizedGain,
        status: inventory.listingStatus,
        added_at: inventory.addedAt,
        platforms_listed: inventory.listedPlatforms,
        player_name: players.name,
      })
      .from(inventory)
      .leftJoin(players, eq(inventory.playerId, players.id))
      .where(sql`${inventory.userId} = ${userId} AND ${inventory.listingStatus} IN ('unlisted', 'listed')`)
      .orderBy(desc(inventory.addedAt))
      .limit(50);
  }

  async getRecentTransactions(userId: string) {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(10);
  }

  async getPortfolioSnapshot(userId: string) {
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) as total_cards,
        COUNT(*) FILTER (WHERE listing_status = 'listed') as listed_cards,
        COUNT(*) FILTER (WHERE listing_status = 'unlisted') as unlisted_cards,
        COUNT(*) FILTER (WHERE unrealized_gain > 0) as gaining_value,
        COUNT(*) FILTER (WHERE unrealized_gain < 0) as losing_value,
        COUNT(*) FILTER (WHERE (CURRENT_DATE - DATE(added_at)) > 60) as aging_alerts
      FROM inventory
      WHERE user_id = ${userId} AND listing_status IN ('unlisted', 'listed')
    `);
    
    const agingCardsResult = await db.execute(sql`
      SELECT 
        p.name as player,
        i.grade_key as grade,
        (CURRENT_DATE - DATE(i.added_at)) as "daysHeld",
        CASE WHEN COALESCE(i.cost_basis, 0) > 0 
             THEN (COALESCE(i.unrealized_gain, 0) / i.cost_basis) * 100 
             ELSE 0 END as change
      FROM inventory i
      LEFT JOIN players p ON p.id = i.player_id
      WHERE i.user_id = ${userId} 
        AND i.listing_status IN ('unlisted', 'listed')
        AND (CURRENT_DATE - DATE(i.added_at)) > 60
      LIMIT 10
    `);

    return {
      snapshotRow: result.rows[0],
      agingCardsRows: agingCardsResult.rows
    };
  }
}
