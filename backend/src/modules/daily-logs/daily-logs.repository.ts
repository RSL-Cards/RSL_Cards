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
        COALESCE(player_name, CASE WHEN type = 'trade' THEN 'Trade Transaction' ELSE 'Transaction' END)::text as description, 
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

  async getAllDailyLogs(userId: string) {
    // Refresh materialized view to get latest transaction stats
    await db.execute(sql`REFRESH MATERIALIZED VIEW mv_daily_log_stats`);

    const result = await db.execute(sql`
      SELECT 
        dl.id::text,
        dl.user_id::text as "userId",
        dl.name,
        dl.status::text,
        dl.starting_cash::numeric as "startingCash",
        dl.updated_after_closing as "updatedAfterClosing",
        dl.created_at as "createdAt",
        dl.closed_at as "closedAt",
        COALESCE(s.money_in, 0)::numeric as money_in,
        COALESCE(s.money_out, 0)::numeric as money_out,
        COALESCE(s.cards_bought, 0)::integer as cards_bought,
        COALESCE(s.cards_sold, 0)::integer as cards_sold,
        COALESCE(e.total_expenses, 0)::numeric as total_expenses,
        COALESCE(t.trades_count, 0)::integer as trades_count,
        COALESCE(s_cost.cost_of_cards_sold, 0)::numeric as cost_of_cards_sold
      FROM daily_logs dl
      LEFT JOIN mv_daily_log_stats s ON dl.id = s.daily_log_id
      LEFT JOIN (
        SELECT daily_log_id, SUM(amount) as total_expenses 
        FROM expenses 
        GROUP BY daily_log_id
      ) e ON dl.id = e.daily_log_id
      LEFT JOIN (
        SELECT daily_log_id, COUNT(*) as trades_count 
        FROM transactions 
        WHERE type = 'trade'
        GROUP BY daily_log_id
      ) t ON dl.id = t.daily_log_id
      LEFT JOIN (
        SELECT daily_log_id, SUM(cost_basis) as cost_of_cards_sold 
        FROM transactions 
        WHERE type = 'sell'
        GROUP BY daily_log_id
      ) s_cost ON dl.id = s_cost.daily_log_id
      WHERE dl.user_id = ${userId}
      ORDER BY dl.created_at DESC
    `);

    return (result.rows as any[]).map(row => {
      const startingCash = parseFloat(row.startingCash || "0");
      const revenue = parseFloat(row.money_in || "0");
      const purchases = parseFloat(row.money_out || "0");
      const costOfCardsSold = parseFloat(row.cost_of_cards_sold || "0");
      const expenses = parseFloat(row.total_expenses || "0");
      const profit = revenue - costOfCardsSold - expenses;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
      const expectedEndingCash = startingCash + revenue - purchases - expenses;

      return {
        id: row.id,
        userId: row.userId,
        name: row.name,
        status: row.status,
        startingCash: startingCash.toFixed(2),
        updatedAfterClosing: row.updatedAfterClosing,
        createdAt: row.createdAt,
        closedAt: row.closedAt,
        stats: {
          cardsBought: row.cards_bought,
          cardsSold: row.cards_sold,
          trades: row.trades_count,
          revenue: revenue.toFixed(2),
          purchases: purchases.toFixed(2),
          costOfCardsSold: costOfCardsSold.toFixed(2),
          expenses: expenses.toFixed(2),
          profit: profit.toFixed(2),
          profitMargin: profitMargin.toFixed(1),
          expectedEndingCash: expectedEndingCash.toFixed(2),
        }
      };
    });
  }

  async updateDailyLog(userId: string, logId: string, name: string, startingCash: number) {
    const [existing] = await db
      .select({ status: dailyLogs.status })
      .from(dailyLogs)
      .where(and(eq(dailyLogs.id, logId), eq(dailyLogs.userId, userId)))
      .limit(1);
    
    if (!existing) throw new Error("Daily log not found");
    
    const setClause: any = {
      name,
      startingCash: startingCash.toString(),
    };
    
    if (existing.status === "closed") {
      setClause.updatedAfterClosing = true;
    }
    
    const [updated] = await db
      .update(dailyLogs)
      .set(setClause)
      .where(and(eq(dailyLogs.id, logId), eq(dailyLogs.userId, userId)))
      .returning();
      
    return updated;
  }

  async getDailyLogsByQuery(userId: string, params?: { search?: string; status?: string; limit?: number; logId?: string }) {
    await db.execute(sql`REFRESH MATERIALIZED VIEW mv_daily_log_stats`);

    const { search, status, limit = 20, logId } = params || {};

    const whereConditions = [sql`dl.user_id = ${userId}`];
    if (logId) {
      whereConditions.push(sql`dl.id = ${logId}`);
    }
    if (search) {
      whereConditions.push(sql`dl.name ILIKE ${'%' + search + '%'}`);
    }
    if (status) {
      whereConditions.push(sql`dl.status = ${status}`);
    }

    const whereClause = sql.join(whereConditions, sql` AND `);

    const result = await db.execute(sql`
      SELECT 
        dl.id::text,
        dl.user_id::text as "userId",
        dl.name,
        dl.status::text,
        dl.starting_cash::numeric as "startingCash",
        dl.updated_after_closing as "updatedAfterClosing",
        dl.created_at as "createdAt",
        dl.closed_at as "closedAt",
        COALESCE(s.money_in, 0)::numeric as money_in,
        COALESCE(s.money_out, 0)::numeric as money_out,
        COALESCE(s.cards_bought, 0)::integer as cards_bought,
        COALESCE(s.cards_sold, 0)::integer as cards_sold,
        COALESCE(e.total_expenses, 0)::numeric as total_expenses,
        COALESCE(t.trades_count, 0)::integer as trades_count,
        COALESCE(s_cost.cost_of_cards_sold, 0)::numeric as cost_of_cards_sold
      FROM daily_logs dl
      LEFT JOIN mv_daily_log_stats s ON dl.id = s.daily_log_id
      LEFT JOIN (
        SELECT daily_log_id, SUM(amount) as total_expenses 
        FROM expenses 
        GROUP BY daily_log_id
      ) e ON dl.id = e.daily_log_id
      LEFT JOIN (
        SELECT daily_log_id, COUNT(*) as trades_count 
        FROM transactions 
        WHERE type = 'trade'
        GROUP BY daily_log_id
      ) t ON dl.id = t.daily_log_id
      LEFT JOIN (
        SELECT daily_log_id, SUM(cost_basis) as cost_of_cards_sold 
        FROM transactions 
        WHERE type = 'sell'
        GROUP BY daily_log_id
      ) s_cost ON dl.id = s_cost.daily_log_id
      WHERE ${whereClause}
      ORDER BY dl.created_at DESC
      LIMIT ${Math.min(Number(limit), 50)}
    `);

    return (result.rows as any[]).map(row => {
      const startingCash = parseFloat(row.startingCash || "0");
      const revenue = parseFloat(row.money_in || "0");
      const purchases = parseFloat(row.money_out || "0");
      const costOfCardsSold = parseFloat(row.cost_of_cards_sold || "0");
      const expenses = parseFloat(row.total_expenses || "0");
      const profit = revenue - costOfCardsSold - expenses;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
      const expectedEndingCash = startingCash + revenue - purchases - expenses;

      return {
        id: row.id,
        userId: row.userId,
        name: row.name,
        status: row.status,
        startingCash: startingCash.toFixed(2),
        updatedAfterClosing: row.updatedAfterClosing,
        createdAt: row.createdAt,
        closedAt: row.closedAt,
        stats: {
          cardsBought: row.cards_bought,
          cardsSold: row.cards_sold,
          trades: row.trades_count,
          revenue: revenue.toFixed(2),
          purchases: purchases.toFixed(2),
          costOfCardsSold: costOfCardsSold.toFixed(2),
          expenses: expenses.toFixed(2),
          profit: profit.toFixed(2),
          profitMargin: profitMargin.toFixed(1),
          expectedEndingCash: expectedEndingCash.toFixed(2),
        }
      };
    });
  }

  async getDailyLogDetailedTransactions(userId: string, params: { logId?: string; logName?: string; type?: string; limit?: number }) {
    let resolvedLogId = params.logId;
    let logName = params.logName;

    if (!resolvedLogId && logName) {
      const logs = await this.getDailyLogsByQuery(userId, { search: logName, limit: 1 });
      if (logs.length > 0) {
        resolvedLogId = logs[0].id;
        logName = logs[0].name;
      } else {
        return { error: `No daily log found matching "${logName}"`, items: [] };
      }
    }

    if (!resolvedLogId) {
      return { error: "Log ID or Log Name is required", items: [] };
    }

    const targetType = params.type;
    const limit = Math.min(Number(params.limit || 20), 50);

    const query = sql`
      SELECT 
        t.id::text, 
        t.type::text, 
        t.price::numeric as amount,
        t.cost_basis::numeric as cost_basis,
        t.profit::numeric as profit,
        t.profit_pct::numeric as profit_pct,
        t.player_name::text as player_name,
        t.grade_key::text as grade_key,
        t.channel::text as channel,
        t.payment_method::text as payment_method,
        t.created_at as time
      FROM transactions t
      WHERE t.daily_log_id = ${resolvedLogId} AND t.user_id = ${userId}
      ${targetType && targetType !== 'expense' ? sql`AND t.type = ${targetType}` : sql``}

      ${!targetType || targetType === 'expense' ? sql`
      UNION ALL

      SELECT 
        e.id::text, 
        'expense' as type, 
        e.amount::numeric as amount,
        NULL as cost_basis,
        NULL as profit,
        NULL as profit_pct,
        (e.category || COALESCE(' - ' || e.description, ''))::text as player_name,
        NULL as grade_key,
        NULL as channel,
        NULL as payment_method,
        e.expense_date as time
      FROM expenses e
      WHERE e.daily_log_id = ${resolvedLogId} AND e.user_id = ${userId}
      ` : sql``}

      ORDER BY time DESC
      LIMIT ${limit}
    `;

    const res = await db.execute(query);

    return {
      logId: resolvedLogId,
      logName,
      totalCount: res.rows.length,
      items: res.rows.map((row: any) => ({
        id: row.id,
        type: row.type,
        playerNameOrDescription: row.player_name,
        gradeKey: row.grade_key,
        amount: row.amount != null ? Number(row.amount).toFixed(2) : "0.00",
        costBasis: row.cost_basis != null ? Number(row.cost_basis).toFixed(2) : null,
        profit: row.profit != null ? Number(row.profit).toFixed(2) : null,
        profitPct: row.profit_pct != null ? `${row.profit_pct}%` : null,
        channel: row.channel,
        paymentMethod: row.payment_method,
        time: row.time,
      }))
    };
  }
}

