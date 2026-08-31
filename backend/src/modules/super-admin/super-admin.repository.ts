import { db } from "../../db/index.js";
import { sql } from "drizzle-orm";

export class SuperAdminRepository {
  async getDashboard(refresh = false) {
    const startTime = performance.now();

    if (refresh) {
      try {
        await db.execute(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY super_admin_dashboard_metrics_mv;`);
      } catch {
        await db.execute(sql`REFRESH MATERIALIZED VIEW super_admin_dashboard_metrics_mv;`);
      }
    }

    const result = await db.execute<{
      total_users: number;
      total_dealers: number;
      total_consumers: number;
      total_admins: number;
      total_super_admins: number;
      total_inventory_cards: number;
      total_unique_cards: number;
      total_card_variants: number;
      last_refreshed_at: string;
    }>(sql`
      SELECT 
        total_users,
        total_dealers,
        total_consumers,
        total_admins,
        total_super_admins,
        total_inventory_cards,
        total_unique_cards,
        total_card_variants,
        last_refreshed_at
      FROM super_admin_dashboard_metrics_mv
      LIMIT 1;
    `);

    const queryDurationMs = Number((performance.now() - startTime).toFixed(2));
    const row = result.rows[0];

    return {
      metrics: {
        totalUsers: Number(row?.total_users ?? 0),
        totalDealers: Number(row?.total_dealers ?? 0),
        totalConsumers: Number(row?.total_consumers ?? 0),
        totalAdmins: Number(row?.total_admins ?? 0),
        totalSuperAdmins: Number(row?.total_super_admins ?? 0),
        totalInventoryCards: Number(row?.total_inventory_cards ?? 0),
        totalUniqueCards: Number(row?.total_unique_cards ?? 0),
        totalCardVariants: Number(row?.total_card_variants ?? 0),
      },
      performance: {
        queryDurationMs,
        optimization: "Materialized View + Composite Indexes",
        lastRefreshedAt: row?.last_refreshed_at ?? new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getUsersMetrics(refresh = false) {
    const startTime = performance.now();

    if (refresh) {
      try {
        await db.execute(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY super_admin_dashboard_metrics_mv;`);
      } catch {
        await db.execute(sql`REFRESH MATERIALIZED VIEW super_admin_dashboard_metrics_mv;`);
      }
    }

    const result = await db.execute<{
      total_users: number;
      total_dealers: number;
      total_consumers: number;
      total_admins: number;
      total_super_admins: number;
      last_refreshed_at: string;
    }>(sql`
      SELECT 
        total_users,
        total_dealers,
        total_consumers,
        total_admins,
        total_super_admins,
        last_refreshed_at
      FROM super_admin_dashboard_metrics_mv
      LIMIT 1;
    `);

    const queryDurationMs = Number((performance.now() - startTime).toFixed(2));
    const row = result.rows[0];

    return {
      metrics: {
        totalUsers: Number(row?.total_users ?? 0),
        totalDealers: Number(row?.total_dealers ?? 0),
        totalConsumers: Number(row?.total_consumers ?? 0),
        totalAdmins: Number(row?.total_admins ?? 0),
        totalSuperAdmins: Number(row?.total_super_admins ?? 0),
      },
      performance: {
        queryDurationMs,
        optimization: "Materialized View + Role Composite Indexes",
        lastRefreshedAt: row?.last_refreshed_at ?? new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getUsersList(page = 1, limit = 10, search = "") {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const offset = (safePage - 1) * safeLimit;
    const cleanSearch = search.trim();

    const startTime = performance.now();

    let countQuery;
    let dataQuery;

    if (cleanSearch) {
      const searchPattern = `%${cleanSearch}%`;
      countQuery = sql`
        SELECT COUNT(*)::int AS total 
        FROM users
        WHERE 
          email ILIKE ${searchPattern}
          OR role::text ILIKE ${searchPattern}
          OR id::text ILIKE ${searchPattern};
      `;

      dataQuery = sql`
        SELECT 
          id,
          email,
          role,
          is_active,
          is_email_verified,
          created_at,
          last_login_at
        FROM users
        WHERE 
          email ILIKE ${searchPattern}
          OR role::text ILIKE ${searchPattern}
          OR id::text ILIKE ${searchPattern}
        ORDER BY created_at DESC
        LIMIT ${safeLimit} OFFSET ${offset};
      `;
    } else {
      countQuery = sql`SELECT COUNT(*)::int AS total FROM users;`;

      dataQuery = sql`
        SELECT 
          id,
          email,
          role,
          is_active,
          is_email_verified,
          created_at,
          last_login_at
        FROM users
        ORDER BY created_at DESC
        LIMIT ${safeLimit} OFFSET ${offset};
      `;
    }

    const countResult = await db.execute<{ total: number }>(countQuery);
    const total = Number(countResult.rows[0]?.total ?? 0);

    const itemsResult = await db.execute<{
      id: string;
      email: string;
      role: string;
      is_active: boolean;
      is_email_verified: boolean;
      created_at: string;
      last_login_at: string | null;
    }>(dataQuery);

    const queryDurationMs = Number((performance.now() - startTime).toFixed(2));
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));

    const users = itemsResult.rows.map((row) => ({
      id: row.id,
      email: row.email,
      role: row.role,
      isActive: Boolean(row.is_active),
      isEmailVerified: Boolean(row.is_email_verified),
      createdAt: row.created_at,
      lastLoginAt: row.last_login_at,
    }));

    return {
      data: users,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
        search: cleanSearch,
      },
      performance: {
        queryDurationMs,
        optimization: cleanSearch ? "ILIKE Search on Users Table" : "Indexed Scan on users (created_at DESC)",
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getCardsMetrics(refresh = false) {
    const startTime = performance.now();

    if (refresh) {
      try {
        await db.execute(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY super_admin_cards_metrics_mv;`);
      } catch {
        await db.execute(sql`REFRESH MATERIALIZED VIEW super_admin_cards_metrics_mv;`);
      }
    }

    const result = await db.execute<{
      total_cards: number;
      unique_cards: number;
      total_variants: number;
      graded_cards: number;
      non_graded_cards: number;
      last_refreshed_at: string;
    }>(sql`
      SELECT 
        total_cards,
        unique_cards,
        total_variants,
        graded_cards,
        non_graded_cards,
        last_refreshed_at
      FROM super_admin_cards_metrics_mv
      LIMIT 1;
    `);

    const queryDurationMs = Number((performance.now() - startTime).toFixed(2));
    const row = result.rows[0];

    return {
      metrics: {
        totalCards: Number(row?.total_cards ?? 0),
        uniqueCards: Number(row?.unique_cards ?? 0),
        totalVariants: Number(row?.total_variants ?? 0),
        gradedCards: Number(row?.graded_cards ?? 0),
        nonGradedCards: Number(row?.non_graded_cards ?? 0),
      },
      performance: {
        queryDurationMs,
        optimization: "Materialized View + Grade Composite Indexes",
        lastRefreshedAt: row?.last_refreshed_at ?? new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getCardsInventory(page = 1, limit = 10, search = "") {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const offset = (safePage - 1) * safeLimit;
    const cleanSearch = search.trim();

    const startTime = performance.now();

    let countQuery;
    let dataQuery;

    if (cleanSearch) {
      const searchPattern = `%${cleanSearch}%`;
      countQuery = sql`
        SELECT COUNT(*)::int AS total 
        FROM inventory inv
        INNER JOIN users u ON u.id = inv.user_id
        LEFT JOIN players p ON p.id = inv.player_id
        LEFT JOIN cards c ON c.id = inv.card_id
        LEFT JOIN card_variants cv ON cv.id = inv.variant_id
        WHERE 
          p.name ILIKE ${searchPattern}
          OR inv.set_name ILIKE ${searchPattern}
          OR c.set_name ILIKE ${searchPattern}
          OR inv.variation ILIKE ${searchPattern}
          OR inv.card_number ILIKE ${searchPattern}
          OR inv.grade_company ILIKE ${searchPattern}
          OR cv.name ILIKE ${searchPattern}
          OR u.email ILIKE ${searchPattern};
      `;

      dataQuery = sql`
        SELECT 
          inv.id AS inventory_id,
          inv.user_id,
          u.email AS user_email,
          inv.card_id,
          inv.variant_id,
          inv.player_id,
          COALESCE(p.name, 'Unknown Player') AS player_name,
          inv.year,
          COALESCE(inv.set_name, c.set_name, 'Unknown Set') AS set_name,
          inv.variation,
          inv.card_number,
          COALESCE(inv.sport, p.sport, 'Other') AS sport,
          inv.grade_company,
          inv.grade_value,
          inv.grade_key,
          inv.cost_basis,
          inv.current_market_value,
          inv.quantity,
          inv.listing_status,
          cv.name AS variant_name,
          cv.is_parallel AS variant_is_parallel,
          cv.print_run AS variant_print_run,
          inv.added_at
        FROM inventory inv
        INNER JOIN users u ON u.id = inv.user_id
        LEFT JOIN players p ON p.id = inv.player_id
        LEFT JOIN cards c ON c.id = inv.card_id
        LEFT JOIN card_variants cv ON cv.id = inv.variant_id
        WHERE 
          p.name ILIKE ${searchPattern}
          OR inv.set_name ILIKE ${searchPattern}
          OR c.set_name ILIKE ${searchPattern}
          OR inv.variation ILIKE ${searchPattern}
          OR inv.card_number ILIKE ${searchPattern}
          OR inv.grade_company ILIKE ${searchPattern}
          OR cv.name ILIKE ${searchPattern}
          OR u.email ILIKE ${searchPattern}
        ORDER BY inv.added_at DESC
        LIMIT ${safeLimit} OFFSET ${offset};
      `;
    } else {
      countQuery = sql`
        SELECT COUNT(*)::int AS total FROM inventory;
      `;

      dataQuery = sql`
        SELECT 
          inv.id AS inventory_id,
          inv.user_id,
          u.email AS user_email,
          inv.card_id,
          inv.variant_id,
          inv.player_id,
          COALESCE(p.name, 'Unknown Player') AS player_name,
          inv.year,
          COALESCE(inv.set_name, c.set_name, 'Unknown Set') AS set_name,
          inv.variation,
          inv.card_number,
          COALESCE(inv.sport, p.sport, 'Other') AS sport,
          inv.grade_company,
          inv.grade_value,
          inv.grade_key,
          inv.cost_basis,
          inv.current_market_value,
          inv.quantity,
          inv.listing_status,
          cv.name AS variant_name,
          cv.is_parallel AS variant_is_parallel,
          cv.print_run AS variant_print_run,
          inv.added_at
        FROM inventory inv
        INNER JOIN users u ON u.id = inv.user_id
        LEFT JOIN players p ON p.id = inv.player_id
        LEFT JOIN cards c ON c.id = inv.card_id
        LEFT JOIN card_variants cv ON cv.id = inv.variant_id
        ORDER BY inv.added_at DESC
        LIMIT ${safeLimit} OFFSET ${offset};
      `;
    }

    const countResult = await db.execute<{ total: number }>(countQuery);
    const total = Number(countResult.rows[0]?.total ?? 0);

    const itemsResult = await db.execute<{
      inventory_id: string;
      user_id: string;
      user_email: string;
      card_id: string | null;
      variant_id: string | null;
      player_id: string | null;
      player_name: string | null;
      year: number | null;
      set_name: string | null;
      variation: string | null;
      card_number: string | null;
      sport: string | null;
      grade_company: string | null;
      grade_value: string | null;
      grade_key: string | null;
      cost_basis: string | null;
      current_market_value: string | null;
      quantity: number;
      listing_status: string;
      variant_name: string | null;
      variant_is_parallel: boolean | null;
      variant_print_run: number | null;
      added_at: string;
    }>(dataQuery);

    const queryDurationMs = Number((performance.now() - startTime).toFixed(2));
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));

    const items = itemsResult.rows.map((row) => {
      const isGraded = Boolean(
        row.grade_company &&
        row.grade_company.trim() !== "" &&
        row.grade_company.toUpperCase() !== "RAW" &&
        (row.grade_key ? row.grade_key.toUpperCase() !== "RAW" : true)
      );

      return {
        id: row.inventory_id,
        isGraded,
        cardName: `${row.year ? row.year + " " : ""}${row.player_name}`,
        playerName: row.player_name,
        year: row.year,
        setName: row.set_name,
        variation: row.variation,
        cardNumber: row.card_number,
        sport: row.sport,
        gradeCompany: row.grade_company ?? "RAW",
        gradeValue: row.grade_value,
        gradeKey: row.grade_key ?? "RAW",
        variantName: row.variant_name,
        isParallel: row.variant_is_parallel,
        printRun: row.variant_print_run,
        quantity: row.quantity,
        costBasis: row.cost_basis,
        currentMarketValue: row.current_market_value,
        listingStatus: row.listing_status,
        addedAt: row.added_at,
        member: {
          userId: row.user_id,
          email: row.user_email,
        },
      };
    });

    return {
      data: items,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
        search: cleanSearch,
      },
      performance: {
        queryDurationMs,
        optimization: cleanSearch ? "ILIKE Search on Indexed JOIN" : "Indexed INNER JOIN on (inventory, users, players, cards, card_variants)",
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getUsers() {
    return {
      message: "Super-Admin Users list sample data",
      users: [
        { id: "usr_1", name: "System Admin", role: "super-admin", status: "Active" },
        { id: "usr_2", name: "Dealer John", role: "dealer", status: "Active" },
        { id: "usr_3", name: "Collector Jane", role: "consumer", status: "Active" },
      ],
      total: 3,
    };
  }

  async getDealers() {
    return {
      message: "Super-Admin Dealers list sample data",
      dealers: [
        { id: "dlr_1", name: "Dealer One", email: "dealer1@rsl.test", totalInventory: 10, status: "Verified" },
        { id: "dlr_2", name: "Dealer Two", email: "dealer2@rsl.test", totalInventory: 10, status: "Verified" },
      ],
      total: 2,
    };
  }

  async getCards() {
    return {
      message: "Super-Admin Cards catalog sample data",
      cards: [
        { id: "seed-card-1", player: "LeBron James", year: 2020, set: "Topps Chrome", sport: "basketball" },
        { id: "seed-card-2", player: "Shohei Ohtani", year: 2021, set: "Topps Chrome", sport: "baseball" },
        { id: "seed-card-3", player: "Patrick Mahomes", year: 2022, set: "Topps Chrome", sport: "football" },
      ],
      total: 3,
    };
  }

  async getSettings() {
    return {
      message: "Super-Admin System Settings configuration",
      maintenanceMode: false,
      registrationEnabled: true,
      maxLoginAttempts: 5,
      environment: process.env.NODE_ENV || "development",
    };
  }
}
