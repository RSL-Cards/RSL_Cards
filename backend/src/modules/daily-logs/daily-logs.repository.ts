import { db } from "../../db/index.js";
import { dailyLogs, mvDailyLogStats } from "../../db/schema/index.js";
import { eq, and, sql } from "drizzle-orm";

export class DailyLogsRepository {
  async createDailyLog(userId: string, name: string, startingCash: number) {
    const [log] = await db
      .insert(dailyLogs)
      .values({
        userId,
        name,
        startingCash: startingCash.toString(),
        status: "open",
      })
      .returning();
    return log;
  }

  async getActiveDailyLog(userId: string) {
    const [log] = await db
      .select()
      .from(dailyLogs)
      .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.status, "open")))
      .limit(1);

    if (!log) return null;

    // Refresh the materialized view before fetching stats
    // Note: Concurrently requires a unique index on the materialized view, 
    // which we might not have set up in drizzle easily. 
    // For now we'll do a standard refresh.
    await db.execute(sql`REFRESH MATERIALIZED VIEW mv_daily_log_stats`);

    const [stats] = await db
      .select()
      .from(mvDailyLogStats)
      .where(eq(mvDailyLogStats.dailyLogId, log.id))
      .limit(1);

    const [expenseData] = await db
      .select({ totalExpenses: sql<string>`sum(amount)` })
      .from(require("../../db/schema/analytics.js").expenses)
      .where(eq(require("../../db/schema/analytics.js").expenses.dailyLogId, log.id));

    const statsData = stats ? { ...stats } : { moneyIn: "0", moneyOut: "0", profit: "0", cardsBought: 0, cardsSold: 0 };
    const expensesTotal = parseFloat(expenseData?.totalExpenses || "0");
    
    statsData.moneyIn = (parseFloat((statsData.moneyIn as string) || "0")).toFixed(2);
    statsData.moneyOut = (parseFloat((statsData.moneyOut as string) || "0") + expensesTotal).toFixed(2);
    statsData.profit = (parseFloat((statsData.profit as string) || "0") - expensesTotal).toFixed(2);
    (statsData as any).expenses = expensesTotal.toFixed(2);

    return { ...log, stats: statsData };
  }

  async closeDailyLog(userId: string, logId: string) {
    const [log] = await db
      .update(dailyLogs)
      .set({
        status: "closed",
        closedAt: new Date(),
      })
      .where(and(eq(dailyLogs.id, logId), eq(dailyLogs.userId, userId)))
      .returning();
    return log;
  }

  async getDailyLogTransactions(userId: string, logId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    
    const [log] = await db
      .select({ id: dailyLogs.id })
      .from(dailyLogs)
      .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.id, logId)))
      .limit(1);

    if (!log) throw new Error("Daily log not found");

    const result = await db.execute(sql`
      SELECT 
        id::text, 
        type::text, 
        price::numeric as amount, 
        player_name::text as description, 
        created_at as time
      FROM transactions 
      WHERE daily_log_id = ${logId}
      
      UNION ALL
      
      SELECT 
        id::text, 
        'expense' as type, 
        amount::numeric as amount, 
        (category || COALESCE(' - ' || description, ''))::text as description, 
        expense_date as time
      FROM expenses 
      WHERE daily_log_id = ${logId}
      
      ORDER BY time DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    return (result as any).rows;
  }
}
