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
    return { success: true, id: row.id, createdAt: row.created_at, profit, profitPct };
  }

  async postTransactionsTrade(_userId: string, _body: any) {
    return { message: `Record TRADE. Cards given/received with optional cash` };
  }

  async postTransactionsSync(_userId: string, _body: any) {
    return { message: `Bulk sync offline transactions (array of localIds)` };
  }

  async getTransactions(_userId: string, _query: any) {
    return { message: `List all transactions. Query: type, channel, dateFrom, dateTo, page` };
  }

  async getTransactionsId(_userId: string, id: string) {
    return { message: `Get single transaction detail for ${id}` };
  }

  async getTransactionsToday(_userId: string) {
    return { message: `Today's stats: bought, sold, spent, revenue, net profit` };
  }

  async getTransactionsCustomersCustomerId(_userId: string, customerId: string) {
    return { message: `All transactions with a specific customer ${customerId}` };
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

  async deleteTransactionsId(_userId: string, id: string) {
    return { message: `Delete/void a transaction ${id} (with reason)` };
  }
}
