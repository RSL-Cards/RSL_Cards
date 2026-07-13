import { sql } from "drizzle-orm";
import { db } from "../../db/index.js";

export class TransactionRepository {
  async postTransactionsBuy(userId: string, body: any) {
    const {
      inventoryId,
      playerName,
      price,
      costBasis,
      channel = "card_show",
      paymentMethod,
      dealRating,
      compPriceAtTime,
      gradeKey,
      cardSnapshot,
      rslCardId,
    } = body;

    if (!playerName || !price) {
      throw new Error("playerName and price are required");
    }

    const result = await db.execute(sql`
      INSERT INTO transactions (
        id, user_id, inventory_id, type, channel, price, cost_basis,
        payment_method, deal_rating, comp_price_at_time,
        player_name, grade_key, card_snapshot, rsl_card_id, created_at
      ) VALUES (
        gen_random_uuid(),
        ${userId},
        ${inventoryId || null},
        'buy',
        ${channel},
        ${price},
        ${costBasis || price},
        ${paymentMethod || null},
        ${dealRating || null},
        ${compPriceAtTime || null},
        ${playerName},
        ${gradeKey || null},
        ${cardSnapshot || null},
        ${rslCardId || null},
        NOW()
      )
      RETURNING id, created_at
    `);

    const row = result.rows[0] as any;
    return { success: true, id: row.id, createdAt: row.created_at };
  }

  async postTransactionsSell(userId: string, body: any) {
    const {
      inventoryId,
      playerName,
      price,
      costBasis,
      channel = "card_show",
      paymentMethod,
      dealRating,
      compPriceAtTime,
      gradeKey,
      cardSnapshot,
      rslCardId,
    } = body;

    if (!playerName || !price) {
      throw new Error("playerName and price are required");
    }

    const sellPrice = parseFloat(price);
    const cost = parseFloat(costBasis || "0");
    const profit = sellPrice - cost;
    const profitPct = cost > 0 ? Math.round((profit / cost) * 100) : null;

    const result = await db.execute(sql`
      INSERT INTO transactions (
        id, user_id, inventory_id, type, channel, price, cost_basis,
        profit, profit_pct, payment_method, deal_rating, comp_price_at_time,
        player_name, grade_key, card_snapshot, rsl_card_id, created_at
      ) VALUES (
        gen_random_uuid(),
        ${userId},
        ${inventoryId || null},
        'sell',
        ${channel},
        ${sellPrice},
        ${cost},
        ${profit},
        ${profitPct},
        ${paymentMethod || null},
        ${dealRating || null},
        ${compPriceAtTime || null},
        ${playerName},
        ${gradeKey || null},
        ${cardSnapshot || null},
        ${rslCardId || null},
        NOW()
      )
      RETURNING id, created_at
    `);

    // Mark inventory item as sold
    if (inventoryId) {
      await db.execute(sql`
        UPDATE inventory
        SET listing_status = 'sold', updated_at = NOW()
        WHERE id = ${inventoryId} AND user_id = ${userId}
      `);
    }

    const row = result.rows[0] as any;

    // Send push/SSE notification for new sale
    try {
      const prefResult = await db.execute(sql`
        SELECT notification_preferences FROM dealer_profiles
        WHERE user_id = ${userId}
        LIMIT 1
      `);
      
      let sendPush = true;
      if (prefResult.rows.length > 0) {
        const prefs = prefResult.rows[0].notification_preferences as any;
        if (prefs && prefs.newSales) {
          sendPush = !!prefs.newSales.push;
        }
      }

      if (sendPush) {
        const { NotificationRepository } = await import("../notification/notification.repository.js");
        const { NotificationService } = await import("../notification/notification.service.js");
        const notifRepository = new NotificationRepository();
        const notifService = new NotificationService(notifRepository);
        await notifService.sendNotification(
          userId,
          "New Sale Recorded",
          `Sold ${playerName}${gradeKey ? ` (${gradeKey})` : ""} for $${sellPrice.toFixed(2)}. Profit: $${profit.toFixed(2)}${profitPct !== null ? ` (${profitPct}%)` : ""}.`,
          "sale",
          { transactionId: row.id }
        );
      }
    } catch (err: any) {
      console.error(`[TRANSACTION] Failed to send new sale notification: ${err.message}`);
    }

    // Invalidate inventory summary cache as item count / value has changed
    try {
      const { redisAdapter } = await import("../../adapters/redis.adapter.js");
      await redisAdapter.delete(`cache:inventory_summary:${userId}`);
    } catch (err: any) {
      console.error(`[TRANSACTION] Redis summary cache invalidate failed: ${err.message}`);
    }

    return { success: true, id: row.id, createdAt: row.created_at, profit, profitPct };
  }

  async postTransactionsTrade(_userId: string, _body: any) {
    return { message: `Record TRADE. Cards given/received with optional cash` };
  }

  async postTransactionsSync(_userId: string, _body: any) {
    return { message: `Bulk sync offline transactions (array of localIds)` };
  }

  async getTransactions(userId: string, query: any) {
    const {
      type,
      channel,
      search,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
    } = query || {};

    const offset = (Number(page) - 1) * Number(limit);

    const result = await db.execute(sql`
      SELECT 
        t.id,
        t.type,
        t.channel,
        t.player_name,
        t.grade_key,
        t.price,
        t.cost_basis,
        t.profit,
        t.profit_pct,
        t.payment_method,
        t.deal_rating,
        t.comp_price_at_time,
        t.created_at,
        i.photos as inventory_photos
      FROM transactions t
      LEFT JOIN inventory i ON t.inventory_id = i.id
      WHERE t.user_id = ${userId}
      ${type ? sql`AND t.type = ${type}` : sql``}
      ${channel ? sql`AND t.channel = ${channel}` : sql``}
      ${search ? sql`AND (t.player_name ILIKE ${'%' + search + '%'} OR t.grade_key ILIKE ${'%' + search + '%'})` : sql``}
      ${dateFrom ? sql`AND t.created_at >= ${dateFrom}::timestamptz` : sql``}
      ${dateTo ? sql`AND t.created_at <= ${dateTo}::timestamptz` : sql``}
      ORDER BY t.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${offset}
    `);

    const countResult = await db.execute(sql`
      SELECT COUNT(*) as total FROM transactions t
      WHERE t.user_id = ${userId}
      ${type ? sql`AND t.type = ${type}` : sql``}
      ${channel ? sql`AND t.channel = ${channel}` : sql``}
      ${search ? sql`AND (t.player_name ILIKE ${'%' + search + '%'} OR t.grade_key ILIKE ${'%' + search + '%'})` : sql``}
      ${dateFrom ? sql`AND t.created_at >= ${dateFrom}::timestamptz` : sql``}
      ${dateTo ? sql`AND t.created_at <= ${dateTo}::timestamptz` : sql``}
    `);

    return {
      items: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(countResult.rows[0]?.total || 0),
      },
    };
  }

  async getTransactionsId(userId: string, id: string) {
    const result = await db.execute(sql`
      SELECT t.*, i.photos as inventory_photos, i.set_name, i.year, i.card_number
      FROM transactions t
      LEFT JOIN inventory i ON t.inventory_id = i.id
      WHERE t.id = ${id} AND t.user_id = ${userId}
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      throw new Error("Transaction not found");
    }

    return result.rows[0];
  }

  async getTransactionsToday(userId: string) {
    const rows = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE type = 'buy')                          AS cards_bought,
        COUNT(*) FILTER (WHERE type = 'sell')                         AS cards_sold,
        COALESCE(SUM(price) FILTER (WHERE type = 'buy'), 0)           AS total_spent,
        COALESCE(SUM(price) FILTER (WHERE type = 'sell'), 0)          AS total_revenue,
        COALESCE(SUM(profit) FILTER (WHERE type = 'sell'), 0)         AS net_profit
      FROM transactions
      WHERE user_id = ${userId}
        AND created_at >= CURRENT_DATE
    `);
    const r = (rows.rows[0] as any) ?? {};
    return {
      cards_bought: Number(r.cards_bought ?? 0),
      cards_sold: Number(r.cards_sold ?? 0),
      total_spent: parseFloat(r.total_spent ?? "0").toFixed(2),
      total_revenue: parseFloat(r.total_revenue ?? "0").toFixed(2),
      net_profit: parseFloat(r.net_profit ?? "0").toFixed(2),
    };
  }

  async getTransactionsCustomersCustomerId(userId: string, customerId: string) {
    const result = await db.execute(sql`
      SELECT * FROM transactions
      WHERE user_id = ${userId} AND customer_id = ${customerId}
      ORDER BY created_at DESC
    `);
    return { items: result.rows, total: result.rows.length };
  }

  async getTransactionsExport(userId: string, query: any) {
    const { dateFrom, dateTo } = query ?? {};

    const result = await db.execute(sql`
      SELECT 
        t.id,
        t.type,
        t.channel,
        t.player_name,
        t.grade_key,
        t.price,
        t.cost_basis,
        t.profit,
        t.profit_pct,
        t.payment_method,
        t.deal_rating,
        t.comp_price_at_time,
        t.created_at
      FROM transactions t
      WHERE t.user_id = ${userId}
      ${dateFrom ? sql`AND t.created_at >= ${dateFrom}::timestamptz` : sql``}
      ${dateTo ? sql`AND t.created_at <= ${dateTo}::timestamptz` : sql``}
      ORDER BY t.created_at DESC
    `);

    return { rows: result.rows, total: result.rows.length };
  }

  async deleteTransactionsId(userId: string, id: string) {
    const result = await db.execute(sql`
      DELETE FROM transactions
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `);
    if (result.rows.length === 0) {
      throw new Error("Transaction not found or not owned by user");
    }
    return { success: true, id: result.rows[0].id };
  }
}
