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

  async getInventory(userId: string, page: number = 1, limit: number = 20, search?: string) {
    const offset = (page - 1) * limit;

    let condition = sql`${inventory.userId} = ${userId} AND ${inventory.listingStatus} IN ('unlisted', 'listed')`;

    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      condition = sql`${condition} AND (LOWER(${players.name}) LIKE ${searchLower} OR LOWER(${inventory.setName}) LIKE ${searchLower})`;
    }

    const items = await db
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
        photos: inventory.photos,
      })
      .from(inventory)
      .leftJoin(players, eq(inventory.playerId, players.id))
      .where(condition)
      .orderBy(desc(inventory.addedAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: count() })
      .from(inventory)
      .leftJoin(players, eq(inventory.playerId, players.id))
      .where(condition);

    return {
      items,
      total: totalResult[0].count,
      page,
      limit,
    };
  }

  async getInventoryCounts(userId: string) {
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE listing_status = 'listed') as listed,
        COUNT(*) FILTER (WHERE listing_status = 'unlisted') as unlisted
      FROM inventory
      WHERE user_id = ${userId} AND listing_status IN ('unlisted', 'listed')
    `);
    return result.rows[0];
  }

  async getInventoryItemDetails(userId: string, inventoryId: string) {
    const itemResult = await db
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
        photos: inventory.photos,
        variant_id: inventory.variantId,
      })
      .from(inventory)
      .leftJoin(players, eq(inventory.playerId, players.id))
      .where(and(eq(inventory.id, inventoryId), eq(inventory.userId, userId)))
      .limit(1);

    if (!itemResult.length) return null;
    const item = itemResult[0];

    const activeListings = await db.execute(sql`
      SELECT platform, platform_listing_id, status, list_price, created_at
      FROM listings
      WHERE inventory_id = ${inventoryId} AND user_id = ${userId} AND status IN ('active', 'draft', 'pending')
    `);

    let comps: any[] = [];
    if (item.variant_id && item.grade_key) {
      const compsResult = await db.execute(sql`
        SELECT platform, sold_price, sold_at, title
        FROM platform_sold_listings
        WHERE variant_id = ${item.variant_id} AND grade_key = ${item.grade_key}
        ORDER BY sold_at DESC
        LIMIT 5
      `);
      comps = compsResult.rows;
    }

    return {
      item,
      activeListings: activeListings.rows,
      soldComps: comps,
    };
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
