import { sql } from "drizzle-orm";
import { db } from "../../db/index.js";

export class AnalyticsRepository {
  async getDaily(userId: string) {
    const rows = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE type = 'buy')                          AS cards_bought,
        COUNT(*) FILTER (WHERE type = 'sell')                         AS cards_sold,
        COALESCE(SUM(price) FILTER (WHERE type = 'buy'), 0)           AS total_spent,
        COALESCE(SUM(price) FILTER (WHERE type = 'sell'), 0)          AS total_revenue,
        COALESCE(SUM(profit) FILTER (WHERE type = 'sell'), 0)         AS net_profit
      FROM transactions
      WHERE user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '24 hours'
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

  async getTodayActivity(userId: string) {
    const rows = await db.execute(sql`
      SELECT
        t.id, t.type, t.price, t.profit, t.player_name, t.created_at,
        i.photos as inventory_photos,
        t.card_snapshot
      FROM transactions t
      LEFT JOIN inventory i ON i.id = t.inventory_id
      WHERE t.user_id = ${userId}
        AND t.created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY t.created_at DESC
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

      return {
        id: r.id,
        type: r.type,
        price: parseFloat(r.price ?? "0").toFixed(2),
        profit: r.profit != null ? parseFloat(r.profit).toFixed(2) : null,
        playerName: r.player_name ?? "Unknown Card",
        imageUrl,
        time: new Date(r.created_at).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      };
    });
  }

  async getReport(userId: string, period: string) {
    const interval = period === "month" ? "30 days" : "7 days";
    const rows = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE type = 'buy')                          AS cards_bought,
        COUNT(*) FILTER (WHERE type = 'sell')                         AS cards_sold,
        COALESCE(SUM(price)   FILTER (WHERE type = 'buy'),  0)        AS total_spent,
        COALESCE(SUM(price)   FILTER (WHERE type = 'sell'), 0)        AS total_revenue,
        COALESCE(SUM(profit)  FILTER (WHERE type = 'sell'), 0)        AS net_profit,
        CASE WHEN COALESCE(SUM(price) FILTER (WHERE type='sell'),0) > 0
          THEN ROUND(COALESCE(SUM(profit) FILTER (WHERE type='sell'),0)
               / COALESCE(SUM(price) FILTER (WHERE type='sell'),1) * 100, 1)
          ELSE 0 END                                                   AS avg_margin
      FROM transactions
      WHERE user_id = ${userId}
        AND created_at >= NOW() - CAST(${interval} AS INTERVAL)
    `);
    const r = (rows.rows[0] as any) ?? {};
    return {
      period,
      cards_bought: Number(r.cards_bought ?? 0),
      cards_sold: Number(r.cards_sold ?? 0),
      total_spent: parseFloat(r.total_spent ?? "0").toFixed(2),
      total_revenue: parseFloat(r.total_revenue ?? "0").toFixed(2),
      net_profit: parseFloat(r.net_profit ?? "0").toFixed(2),
      avg_margin: parseFloat(r.avg_margin ?? "0"),
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
    return (rows.rows as any[]).map((r) => ({
      channel: r.channel,
      revenue: parseFloat(r.revenue ?? "0"),
      profit: parseFloat(r.profit ?? "0"),
      sales: Number(r.sales ?? 0),
    }));
  }

  async getProfitBySport(userId: string) { return { message: "Profit by sport" }; }
  async getTopCards(userId: string) { return { message: "Top cards" }; }
  async getInventoryValueTrend(userId: string) { return { message: "Inventory trend" }; }
  async getPlatformPerformance(userId: string) { return { message: "Platform performance" }; }
  async getTaxYear(userId: string, year: string) { return { message: `Tax for ${year}` }; }
  async getExpenses(userId: string) { return { message: "Expenses" }; }
  async postExpense(userId: string, body: any) { return { success: true }; }
  async patchExpense(userId: string, id: string, body: any) { return { success: true }; }
  async deleteExpense(userId: string, id: string) { return { success: true }; }
  async getCollection(userId: string) { return { message: "Collection" }; }
  async getWeeklyRecap(userId: string) { return { message: "Weekly recap" }; }
}
