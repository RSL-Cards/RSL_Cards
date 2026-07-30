import { sql, and, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { expenses } from "../../db/schema/analytics.js";

export class AnalyticsRepository {
  async getDaily(userId: string) {
    const rows = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE type = 'buy')                          AS cards_bought,
        COUNT(*) FILTER (WHERE type = 'sell')                         AS cards_sold,
        COALESCE(SUM(price) FILTER (WHERE type = 'buy'), 0)           AS total_spent,
        COALESCE(SUM(price) FILTER (WHERE type = 'sell'), 0)          AS total_revenue,
        COALESCE(SUM(cost_basis) FILTER (WHERE type = 'sell'), 0)     AS cost_of_cards_sold,
        COALESCE(SUM(profit) FILTER (WHERE type = 'sell'), 0)         AS net_profit
      FROM transactions
      WHERE user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '24 hours'
    `);
    const expenseRows = await db.execute(sql`
      SELECT COALESCE(SUM(amount), 0) as total_expenses
      FROM expenses
      WHERE user_id = ${userId}
        AND expense_date >= NOW() - INTERVAL '24 hours'
    `);
    const inventoryValRows = await db.execute(sql`
      SELECT COALESCE(SUM(cost_basis * quantity), 0) as total_inventory_cost
      FROM inventory
      WHERE user_id = ${userId} AND listing_status != 'sold'
    `);
    
    const r = (rows.rows[0] as any) ?? {};
    const totalExpenses = parseFloat(((expenseRows.rows[0] as any)?.total_expenses) || "0");
    const revenue = parseFloat(r.total_revenue ?? "0");
    const costOfCardsSold = parseFloat(r.cost_of_cards_sold ?? "0");
    const netProfit = revenue - costOfCardsSold - totalExpenses;
    const currentInventoryCostBasis = parseFloat((inventoryValRows.rows[0] as any)?.total_inventory_cost || "0");
    const avgMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    return {
      cards_bought: Number(r.cards_bought ?? 0),
      cards_sold: Number(r.cards_sold ?? 0),
      total_spent: parseFloat(r.total_spent ?? "0").toFixed(2),
      total_revenue: revenue.toFixed(2),
      cost_of_cards_sold: costOfCardsSold.toFixed(2),
      net_profit: netProfit.toFixed(2),
      expenses: totalExpenses.toFixed(2),
      avg_margin: parseFloat(avgMargin.toFixed(1)),
      current_inventory_cost_basis: currentInventoryCostBasis.toFixed(2),
    };
  }

  async getTodayActivity(userId: string) {
    const rows = await db.execute(sql`
      SELECT
        t.id, t.type::text, t.price, t.profit, t.player_name, t.created_at,
        t.channel, t.payment_method,
        i.photos as inventory_photos,
        t.card_snapshot
      FROM transactions t
      LEFT JOIN inventory i ON i.id = t.inventory_id
      WHERE t.user_id = ${userId}
        AND t.created_at >= NOW() - INTERVAL '24 hours'
      
      UNION ALL
      
      SELECT
        e.id, 'expense' as type, e.amount as price, NULL as profit, e.category as player_name, e.expense_date as created_at,
        NULL as channel, NULL as payment_method,
        NULL as inventory_photos,
        NULL as card_snapshot
      FROM expenses e
      WHERE e.user_id = ${userId}
        AND e.expense_date >= NOW() - INTERVAL '24 hours'
        
      ORDER BY created_at DESC
      LIMIT 20
    `);
    
    return (rows.rows as any[]).map((r) => {
      let imageUrl = null;
      if (r.inventory_photos && r.inventory_photos.length > 0) {
        imageUrl = r.inventory_photos[0];
      } else if (r.card_snapshot) {
        try {
          const snap = JSON.parse(r.card_snapshot);
          if (snap.photos && snap.photos.length > 0) {
            imageUrl = snap.photos[0];
          }
        } catch (e) {}
      }

      let formattedPrice = parseFloat(r.price ?? "0").toFixed(2);
      if (r.type === "trade") {
        const numPrice = parseFloat(r.price ?? "0");
        if (numPrice > 0) {
          formattedPrice = `+$${numPrice.toFixed(2)}`;
        } else if (numPrice < 0) {
          formattedPrice = `-$${Math.abs(numPrice).toFixed(2)}`;
        } else {
          formattedPrice = "Straight Trade";
        }
      }

      return {
        id: r.id,
        type: r.type,
        price: formattedPrice,
        profit: r.profit != null ? parseFloat(r.profit).toFixed(2) : null,
        playerName: r.player_name || (r.type === "trade" ? "Trade Transaction" : "Item"),
        imageUrl,
        channel: r.channel || null,
        paymentMethod: r.payment_method || null,
        time: new Date(r.created_at).toISOString(),
      };
    });
  }

  async getReport(userId: string, period: string) {
    const interval = period === "month" ? "30 days" : period === "ytd" ? "365 days" : "7 days";
    const rows = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE type = 'buy')                          AS cards_bought,
        COUNT(*) FILTER (WHERE type = 'sell')                         AS cards_sold,
        COALESCE(SUM(price)   FILTER (WHERE type = 'buy'),  0)        AS total_spent,
        COALESCE(SUM(price)   FILTER (WHERE type = 'sell'), 0)        AS total_revenue,
        COALESCE(SUM(cost_basis) FILTER (WHERE type = 'sell'), 0)     AS cost_of_cards_sold,
        COALESCE(SUM(profit)  FILTER (WHERE type = 'sell'), 0)        AS net_profit
      FROM transactions
      WHERE user_id = ${userId}
        AND created_at >= NOW() - CAST(${interval} AS INTERVAL)
    `);

    const expenseRows = await db.execute(sql`
      SELECT COALESCE(SUM(amount), 0) as total_expenses
      FROM expenses
      WHERE user_id = ${userId}
        AND expense_date >= NOW() - CAST(${interval} AS INTERVAL)
    `);

    const inventoryValRows = await db.execute(sql`
      SELECT COALESCE(SUM(cost_basis * quantity), 0) as total_inventory_cost
      FROM inventory
      WHERE user_id = ${userId} AND listing_status != 'sold'
    `);
    
    // Fetch daily revenue for bar chart
    const dailyRevenueRows = await db.execute(sql`
      SELECT 
        DATE(created_at) as day,
        COALESCE(SUM(price) FILTER (WHERE type = 'sell'), 0) as revenue
      FROM transactions
      WHERE user_id = ${userId}
        AND created_at >= NOW() - CAST(${interval} AS INTERVAL)
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `);

    // Fetch best deal
    const bestDealRows = await db.execute(sql`
      SELECT 
        player_name as player,
        profit,
        CASE WHEN price > 0 THEN ROUND((profit / price) * 100, 1) ELSE 0 END as margin
      FROM transactions
      WHERE user_id = ${userId}
        AND type = 'sell'
        AND profit > 0
        AND created_at >= NOW() - CAST(${interval} AS INTERVAL)
      ORDER BY profit DESC NULLS LAST
      LIMIT 1
    `);

    const r = (rows.rows[0] as any) ?? {};
    const totalExpenses = parseFloat(((expenseRows.rows[0] as any)?.total_expenses) || "0");
    const revenue = parseFloat(r.total_revenue ?? "0");
    const costOfCardsSold = parseFloat(r.cost_of_cards_sold ?? "0");
    const netProfit = revenue - costOfCardsSold - totalExpenses;
    const avgMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const currentInventoryCostBasis = parseFloat((inventoryValRows.rows[0] as any)?.total_inventory_cost || "0");
    
    const daily_revenue = (dailyRevenueRows.rows as any[]).map(row => ({
      day: new Date(row.day).toISOString().split('T')[0],
      revenue: parseFloat(row.revenue ?? "0")
    }));

    let best_deal = null;
    if (bestDealRows.rows.length > 0) {
      const b = bestDealRows.rows[0] as any;
      best_deal = {
        player: b.player ?? "",
        profit: parseFloat(b.profit ?? "0").toFixed(2),
        margin: parseFloat(b.margin ?? "0")
      };
    }

    return {
      period,
      cards_bought: Number(r.cards_bought ?? 0),
      cards_sold: Number(r.cards_sold ?? 0),
      total_spent: parseFloat(r.total_spent ?? "0").toFixed(2),
      total_revenue: revenue.toFixed(2),
      cost_of_cards_sold: costOfCardsSold.toFixed(2),
      net_profit: netProfit.toFixed(2),
      expenses: totalExpenses.toFixed(2),
      avg_margin: parseFloat(avgMargin.toFixed(1)),
      current_inventory_cost_basis: currentInventoryCostBasis.toFixed(2),
      daily_revenue,
      best_deal
    };
  }

  async getProfitByChannel(userId: string, period: string) {
    const interval = period === "month" ? "30 days" : "7 days";
    const rows = await db.execute(sql`
      SELECT
        channel,
        COALESCE(SUM(price)  FILTER (WHERE type = 'sell'), 0) AS revenue,
        COALESCE(SUM(profit) FILTER (WHERE type = 'sell'), 0) AS profit,
        COUNT(*)             FILTER (WHERE type = 'sell')      AS sales
      FROM transactions
      WHERE user_id = ${userId}
        AND created_at >= NOW() - CAST(${interval} AS INTERVAL)
      GROUP BY channel
      ORDER BY revenue DESC
    `);
    const channels = (rows.rows as any[]).map((r) => ({
      channel: r.channel,
      revenue: parseFloat(r.revenue ?? "0"),
      profit: parseFloat(r.profit ?? "0"),
      sales: Number(r.sales ?? 0),
    }));
    return { period, channels };
  }

  async getProfitBySport(userId: string) { return { message: "Profit by sport" }; }
  async getTopCards(userId: string) { return { message: "Top cards" }; }
  async getInventoryValueTrend(userId: string) { return { message: "Inventory trend" }; }
  async getPlatformPerformance(userId: string) { return { message: "Platform performance" }; }
  async getTaxYear(userId: string, year: string) { return { message: `Tax for ${year}` }; }
  async getExpenses(userId: string) {
    const result = await db.execute(sql`
      SELECT id, daily_log_id as "dailyLogId", category, description, amount::numeric, expense_date as "expenseDate", created_at as "createdAt"
      FROM expenses
      WHERE user_id = ${userId}
      ORDER BY expense_date DESC
    `);
    return result.rows;
  }

  async postExpense(userId: string, body: any) {
    const inserted = await db.insert(expenses).values({
      userId,
      dailyLogId: body.dailyLogId || null,
      category: body.category || "other",
      description: body.description || null,
      amount: body.amount.toString(),
      expenseDate: new Date(),
    }).returning();

    const dailyLogId = body.dailyLogId;
    if (dailyLogId) {
      await db.execute(sql`
        UPDATE daily_logs 
        SET updated_after_closing = TRUE, updated_at = NOW()
        WHERE id = ${dailyLogId} AND status = 'closed'
      `);
    }

    return { success: true, expense: inserted[0] };
  }

  async patchExpense(userId: string, id: string, body: any) {
    const [existing] = await db.select({ dailyLogId: expenses.dailyLogId }).from(expenses).where(eq(expenses.id, id)).limit(1);
    
    const [updated] = await db.update(expenses).set({
      category: body.category,
      description: body.description,
      amount: body.amount?.toString(),
      dailyLogId: body.dailyLogId,
    }).where(and(eq(expenses.id, id), eq(expenses.userId, userId))).returning();

    if (!updated) {
      throw new Error("Expense not found");
    }

    const prevLogId = existing?.dailyLogId;
    const newLogId = body.dailyLogId;
    
    if (prevLogId) {
      await db.execute(sql`UPDATE daily_logs SET updated_after_closing = TRUE, updated_at = NOW() WHERE id = ${prevLogId} AND status = 'closed'`);
    }
    if (newLogId && newLogId !== prevLogId) {
      await db.execute(sql`UPDATE daily_logs SET updated_after_closing = TRUE, updated_at = NOW() WHERE id = ${newLogId} AND status = 'closed'`);
    }

    return { success: true, expense: updated };
  }

  async deleteExpense(userId: string, id: string) {
    const [existing] = await db.select({ dailyLogId: expenses.dailyLogId }).from(expenses).where(eq(expenses.id, id)).limit(1);
    
    const deleted = await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId))).returning();
    if (deleted.length === 0) {
      throw new Error("Expense not found");
    }

    const dailyLogId = existing?.dailyLogId;
    if (dailyLogId) {
      await db.execute(sql`UPDATE daily_logs SET updated_after_closing = TRUE, updated_at = NOW() WHERE id = ${dailyLogId} AND status = 'closed'`);
    }

    return { success: true, id };
  }
  async getCollection(userId: string) { return { message: "Collection" }; }
  async getWeeklyRecap(userId: string) { return { message: "Weekly recap" }; }
}
