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
    } = body;

    if (!playerName || !price) {
      throw new Error("playerName and price are required");
    }

    const result = await db.execute(sql`
      INSERT INTO transactions (
        id, user_id, inventory_id, type, channel, price, cost_basis,
        payment_method, deal_rating, comp_price_at_time,
        player_name, grade_key, card_snapshot, created_at
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
        NOW()
      )
      RETURNING id, created_at
    `);

    const row = result.rows[0] as any;
    return { success: true, id: row.id, createdAt: row.created_at };
  }

  async postTransactionsSell(_userId: string, _body: any) {
    return { message: `Record SELL. Removes from inventory, calculates profit` };
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

  async getTransactionsExport(_userId: string, _query: any) {
    return { message: `Export transactions as CSV for a date range` };
  }

  async deleteTransactionsId(_userId: string, id: string) {
    return { message: `Delete/void a transaction ${id} (with reason)` };
  }
}
