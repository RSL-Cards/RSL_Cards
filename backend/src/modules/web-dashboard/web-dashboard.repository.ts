import { db } from "../../db/index.js";
import { inventory, transactions, players, listings } from "../../db/schema/index.js";
import { sql, eq, and, gte, desc, sum, count, or, inArray } from "drizzle-orm";

export class WebDashboardRepository {
  async getMetrics(userId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
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

    const yesterdayTx = await db
      .select({
        revenue: sum(transactions.price).mapWith(Number),
        profit: sum(transactions.profit).mapWith(Number),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "sell"),
          gte(transactions.createdAt, yesterday),
          sql`${transactions.createdAt} < ${today}`
        )
      );

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
      yesterdayTx: yesterdayTx[0] || { revenue: 0, profit: 0, cards_sold: 0 },
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

    let condition = sql`i.user_id = ${userId} AND i.listing_status IN ('unlisted', 'listed')`;

    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      condition = sql`${condition} AND (LOWER(p.name) LIKE ${searchLower} OR LOWER(i.set_name) LIKE ${searchLower})`;
    }

    const items = await db.execute(sql`
      SELECT 
        i.id,
        i.year,
        i.set_name,
        i.grade_key,
        i.sport,
        i.cost_basis,
        i.current_market_value as market_value,
        (COALESCE(i.current_market_value, 0) - i.cost_basis) as unrealized_gain,
        i.listing_status as status,
        i.added_at,
        i.listed_platforms as platforms_listed,
        p.name as player_name,
        i.photos,
        COALESCE(cs.avg_sold_price, 0) as comp_avg,
        COALESCE(cs.price_trend_30d, 0) as comp_trend,
        COALESCE(cs.lowest_active, 0) as lowest_active,
        (
          SELECT MAX(price) FROM platform_active_listings 
          WHERE variant_id = i.variant_id AND grade_key = i.grade_key
        ) as highest_active,
        (
          SELECT MIN(sold_price) FROM platform_sold_listings 
          WHERE variant_id = i.variant_id AND grade_key = i.grade_key
        ) as lowest_sold,
        (
          SELECT MAX(sold_price) FROM platform_sold_listings 
          WHERE variant_id = i.variant_id AND grade_key = i.grade_key
        ) as highest_sold
      FROM inventory i
      LEFT JOIN players p ON p.id = i.player_id
      LEFT JOIN card_comp_snapshots cs ON cs.variant_id = i.variant_id AND cs.grade_key = i.grade_key AND cs.platform = 'ebay'
      WHERE ${condition}
      ORDER BY i.added_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `);

    const totalResult = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM inventory i
      LEFT JOIN players p ON p.id = i.player_id
      WHERE ${condition}
    `);

    return {
      items: items.rows,
      total: Number((totalResult.rows[0] as any).count || 0),
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
    const itemResult = await db.execute(sql`
      SELECT 
        i.id,
        i.year,
        i.set_name,
        i.grade_key,
        i.sport,
        i.cost_basis,
        i.current_market_value as market_value,
        (COALESCE(i.current_market_value, 0) - i.cost_basis) as unrealized_gain,
        i.listing_status as status,
        i.added_at,
        i.listed_platforms as platforms_listed,
        p.name as player_name,
        i.photos,
        i.variant_id,
        COALESCE(cs.avg_sold_price, 0) as comp_avg,
        COALESCE(cs.price_trend_30d, 0) as comp_trend,
        COALESCE(cs.lowest_active, 0) as lowest_active,
        (
          SELECT MAX(price) FROM platform_active_listings 
          WHERE variant_id = i.variant_id AND grade_key = i.grade_key
        ) as highest_active,
        (
          SELECT MIN(sold_price) FROM platform_sold_listings 
          WHERE variant_id = i.variant_id AND grade_key = i.grade_key
        ) as lowest_sold,
        (
          SELECT MAX(sold_price) FROM platform_sold_listings 
          WHERE variant_id = i.variant_id AND grade_key = i.grade_key
        ) as highest_sold
      FROM inventory i
      LEFT JOIN players p ON p.id = i.player_id
      LEFT JOIN card_comp_snapshots cs ON cs.variant_id = i.variant_id AND cs.grade_key = i.grade_key AND cs.platform = 'ebay'
      WHERE i.id = ${inventoryId} AND i.user_id = ${userId}
      LIMIT 1
    `);

    if (!itemResult.rows.length) return null;
    const item = itemResult.rows[0] as any;

    let activeComps: any[] = [];
    let comps: any[] = [];
    if (item.variant_id && item.grade_key) {
      const activeResult = await db.execute(sql`
        SELECT platform, platform_item_id as platform_listing_id, 'active' as status, price as list_price, created_at, title, image_url, item_web_url
        FROM platform_active_listings
        WHERE variant_id = ${item.variant_id} AND grade_key = ${item.grade_key}
        ORDER BY created_at DESC
        LIMIT 5
      `);
      activeComps = activeResult.rows;

      const compsResult = await db.execute(sql`
        SELECT platform, platform_item_id as platform_listing_id, sold_price, sold_at, title
        FROM platform_sold_listings
        WHERE variant_id = ${item.variant_id} AND grade_key = ${item.grade_key}
        ORDER BY sold_at DESC
        LIMIT 5
      `);
      comps = compsResult.rows;
    }

    return {
      item,
      activeListings: activeComps,
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

  async getPassbookTransactions(userId: string) {
    const result = await db.execute(sql`
      SELECT 
        t.id,
        t.created_at,
        t.type,
        t.channel,
        t.payment_method,
        t.price,
        t.cost_basis,
        t.profit,
        t.player_name,
        t.grade_key,
        c.name as customer_name
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE t.user_id = ${userId}
      ORDER BY t.created_at ASC
    `);
    return result.rows;
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

  async getListings(userId: string) {
    const result = await db
      .select({
        id: listings.id,
        platform: listings.platform,
        listPrice: listings.listPrice,
        status: listings.status,
        netToDealer: listings.netToDealer,
        views: listings.views,
        watchers: listings.watchers,
        offers: listings.offers,
        listedAt: listings.listedAt,
        scheduledAt: listings.scheduledAt,
        year: inventory.year,
        setName: inventory.setName,
        variation: inventory.variation,
        gradeKey: inventory.gradeKey,
        playerName: players.name,
      })
      .from(listings)
      .innerJoin(inventory, eq(listings.inventoryId, inventory.id))
      .leftJoin(players, eq(inventory.playerId, players.id))
      .where(eq(listings.userId, userId))
      .orderBy(desc(listings.createdAt));
      
    return result;
  }

  async updateListingStatus(userId: string, listingId: string, status: string) {
    const updated = await db
      .update(listings)
      .set({ 
        status: status as any, 
        updatedAt: new Date() 
      })
      .where(and(eq(listings.id, listingId), eq(listings.userId, userId)))
      .returning();
      
    return updated[0] || null;
  }

  async getReportData(userId: string, fromDate: string, toDate: string) {
    // 1. Revenue & Profit over time (Grouped by Date)
    const revenueQuery = await db.execute(sql`
      SELECT 
        TO_CHAR(DATE(created_at), 'Mon DD') as date,
        TO_CHAR(DATE(created_at), 'YYYY-MM-DD') as "isoDate",
        COALESCE(SUM(price), 0) as revenue,
        COALESCE(SUM(profit), 0) as profit,
        COUNT(*) as cards_sold
      FROM transactions
      WHERE user_id = ${userId} AND type = 'sell' 
        AND DATE(created_at) >= DATE(${fromDate}) 
        AND DATE(created_at) <= DATE(${toDate})
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `);

    // 2. Sales by Platform (Channel)
    const platformQuery = await db.execute(sql`
      SELECT 
        COALESCE(channel::text, 'Other') as platform,
        COALESCE(SUM(price), 0) as revenue,
        COALESCE(SUM(profit), 0) as profit
      FROM transactions
      WHERE user_id = ${userId} AND type = 'sell'
        AND DATE(created_at) >= DATE(${fromDate}) 
        AND DATE(created_at) <= DATE(${toDate})
      GROUP BY COALESCE(channel::text, 'Other')
      ORDER BY revenue DESC
    `);

    // 3. Margin Data by Dimensions (Computed directly on inventory data or sold data)
    // The frontend margin dimension uses CURRENT inventory data for Sport/Year/Grade.
    const inventoryStatsQuery = await db.execute(sql`
      SELECT 
        sport,
        year::text,
        grade_key as grade,
        (CURRENT_DATE - DATE(added_at)) as days_held,
        current_market_value as value,
        cost_basis as cost
      FROM inventory
      WHERE user_id = ${userId} AND listing_status IN ('listed', 'unlisted')
    `);

    // 4. Oldest Cards
    const oldestCardsQuery = await db.execute(sql`
      SELECT 
        i.id,
        p.name as player_name,
        i.year,
        i.set_name,
        i.grade_key,
        i.photos[1] as image_url,
        (CURRENT_DATE - DATE(i.added_at)) as days_held,
        i.current_market_value as market_value,
        i.cost_basis,
        (COALESCE(i.current_market_value, 0) - i.cost_basis) as unrealized_gain,
        i.listing_status as status
      FROM inventory i
      LEFT JOIN players p ON p.id = i.player_id
      WHERE i.user_id = ${userId} AND i.listing_status IN ('listed', 'unlisted')
      ORDER BY days_held DESC
      LIMIT 4
    `);

    return {
      revenueData: revenueQuery.rows,
      platformSales: platformQuery.rows,
      inventoryStats: inventoryStatsQuery.rows,
      oldestCards: oldestCardsQuery.rows,
    };
  }

  async getAiInsights(userId: string) {
    const result = await db.execute(sql`
      WITH user_insights AS (
        SELECT DISTINCT ON (n.id)
          n.id,
          n.narrative_type as type,
          n.player_name as player,
          n.sport,
          n.headline,
          n.body,
          n.price_change_pct || '%' as price_change,
          n.price_range,
          n.published_at as published,
          n.card_ids,
          n.price_direction as trend,
          n.recommendation
        FROM narratives n
        JOIN players p ON n.player_name ILIKE p.name
        JOIN inventory i ON i.player_id = p.id
        WHERE n.status = 'published'
          AND i.user_id = ${userId}
          AND i.listing_status IN ('unlisted', 'listed')
        ORDER BY n.id
      )
      SELECT * FROM user_insights
      ORDER BY published DESC
      LIMIT 20
    `);

    // Map DB output to match the UI's expected format as closely as possible
    return result.rows.map(row => ({
      ...row,
      affected_cards: row.card_ids ? (row.card_ids as string[]).length : 0,
      published: row.published ? new Date(row.published as string).toISOString() : new Date().toISOString()
    }));
  }

  async getTopMovers(userId?: string) {
    const result = await db.execute(sql`
      SELECT 
        p.name as player,
        cs.price_trend_30d as change,
        cs.avg_sold_price as price,
        cs.grade_key as grade,
        p.sport as sport,
        CASE WHEN cs.price_trend_30d > 0 THEN 'up' ELSE 'down' END as trend,
        'Market Trend' as reason,
        EXISTS (
          SELECT 1 FROM inventory i
          WHERE i.user_id = ${userId || null}
            AND i.player_id = p.id
            AND i.listing_status IN ('unlisted', 'listed')
        ) as in_inventory
      FROM card_comp_snapshots cs
      JOIN card_variants cv ON cs.variant_id = cv.id
      JOIN cards c ON cv.card_id = c.id
      JOIN players p ON c.player_id = p.id
      WHERE cs.price_trend_30d IS NOT NULL AND abs(cs.price_trend_30d) > 5
      ORDER BY abs(cs.price_trend_30d) DESC
      LIMIT 10
    `);
    
    return result.rows.map(row => ({
      player: row.player,
      change: Number(row.change),
      price: Number(row.price),
      grade: row.grade,
      sport: row.sport,
      trend: row.trend,
      reason: row.reason,
      inInventory: !!row.in_inventory
    }));
  }

  async getAffectedInventory(userId: string, playerName: string) {
    const result = await db.execute(sql`
      SELECT 
        i.id,
        i.photos[1] as image_url,
        p.name as player_name,
        i.year,
        i.set_name,
        i.grade_key,
        i.sport,
        i.cost_basis,
        i.current_market_value as market_value,
        i.unrealized_gain,
        CASE WHEN i.cost_basis > 0 THEN (i.unrealized_gain / i.cost_basis) * 100 ELSE 0 END as unrealized_gain_pct,
        i.listing_status as status,
        (CURRENT_DATE - DATE(i.added_at)) as days_held,
        cs.avg_sold_price as comp_avg,
        cs.price_trend_30d as comp_trend,
        i.listed_platforms as platforms_listed
      FROM inventory i
      JOIN players p ON i.player_id = p.id
      LEFT JOIN card_comp_snapshots cs ON cs.variant_id = i.variant_id AND cs.grade_key = i.grade_key
      WHERE i.user_id = ${userId} 
        AND p.name ILIKE ${'%' + playerName + '%'}
        AND i.listing_status IN ('unlisted', 'listed')
    `);

    return result.rows.map(row => ({
      ...row,
      unrealized_gain_pct: Number(row.unrealized_gain_pct),
      days_held: Number(row.days_held),
      comp_avg: Number(row.comp_avg || row.market_value),
      comp_trend: Number(row.comp_trend || 0),
      platforms_listed: row.platforms_listed || []
    }));
  }

  async getCompHistory(insightId: string) {
    // 1. Fetch card_ids for the narrative
    const narrativeResult = await db.execute(sql`
      SELECT card_ids FROM narratives WHERE id = ${insightId} LIMIT 1
    `);
    
    if (narrativeResult.rows.length === 0) return [];
    let cardIds = narrativeResult.rows[0].card_ids as any;
    if (typeof cardIds === 'string') {
      try { cardIds = JSON.parse(cardIds); } catch (e) {}
    }
    if (!Array.isArray(cardIds) || cardIds.length === 0) return [];

    // 2. Query historical prices for these cards
    const idList = cardIds.map((id: string) => sql`${id}`);
    const result = await db.execute(sql`
      SELECT 
        TO_CHAR(cph.recorded_date, 'Mon DD') as date,
        AVG(cph.avg_sold_price)::numeric as price
      FROM card_price_history cph
      JOIN card_variants cv ON cph.variant_id = cv.id
      JOIN cards c ON cv.card_id = c.id
      WHERE c.id IN (${sql.join(idList, sql`, `)}) OR cv.id::text IN (${sql.join(idList, sql`, `)})
      GROUP BY cph.recorded_date, DATE(cph.recorded_date)
      ORDER BY DATE(cph.recorded_date) ASC
      LIMIT 30
    `);

    return result.rows.map(row => ({
      date: row.date,
      price: Number(row.price)
    }));
  }

  async getSportProfitMix(userId: string) {
    const result = await db.execute(sql`
      SELECT 
        COALESCE(i.sport, 'Other') as sport,
        SUM(COALESCE(t.profit, 0))::numeric as profit
      FROM transactions t
      LEFT JOIN inventory i ON t.inventory_id = i.id
      WHERE t.user_id = ${userId} AND t.type = 'sell'
      GROUP BY COALESCE(i.sport, 'Other')
      ORDER BY profit DESC
    `);

    return result.rows.map(row => ({
      sport: row.sport,
      profit: Number(row.profit)
    }));
  }
}
