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

  // ─────────────────────────────────────────────────────────────
  // DEALERS MANAGEMENT OPTIMIZED ENDPOINTS
  // ─────────────────────────────────────────────────────────────

  async getDealersMetrics(refresh = false) {
    const startTime = performance.now();

    const metricsResult = await db.execute<{
      total_dealers: number;
      active_dealers: number;
      total_inventory_cards: number;
      total_sold_cards: number;
      total_inventory_value: string;
      total_sales_volume: string;
    }>(sql`
      SELECT 
        (SELECT COUNT(*)::int FROM users WHERE role = 'dealer') AS total_dealers,
        (SELECT COUNT(DISTINCT user_id)::int FROM inventory WHERE listing_status IN ('listed', 'unlisted')) AS active_dealers,
        (SELECT COUNT(*)::int FROM inventory i JOIN users u ON u.id = i.user_id WHERE u.role = 'dealer' AND i.listing_status IN ('listed', 'unlisted')) AS total_inventory_cards,
        (SELECT COUNT(*)::int FROM transactions t JOIN users u ON u.id = t.user_id WHERE u.role = 'dealer' AND t.type::text = 'sell') AS total_sold_cards,
        (SELECT COALESCE(SUM(CASE WHEN current_market_value > 0 THEN current_market_value ELSE cost_basis END), 0)::text FROM inventory i JOIN users u ON u.id = i.user_id WHERE u.role = 'dealer' AND i.listing_status IN ('listed', 'unlisted')) AS total_inventory_value,
        (SELECT COALESCE(SUM(price), 0)::text FROM transactions t JOIN users u ON u.id = t.user_id WHERE u.role = 'dealer' AND t.type::text = 'sell') AS total_sales_volume;
    `);

    const queryDurationMs = Number((performance.now() - startTime).toFixed(2));
    const row = metricsResult.rows[0];

    const invCount = Number(row?.total_inventory_cards ?? 0);
    const soldCount = Number(row?.total_sold_cards ?? 0);
    const totalCards = invCount + soldCount;

    return {
      metrics: {
        totalDealers: Number(row?.total_dealers ?? 0),
        activeDealers: Number(row?.active_dealers ?? 0),
        totalCards,
        totalInventoryCards: invCount,
        totalSoldCards: soldCount,
        totalInventoryValue: Number(row?.total_inventory_value ?? 0),
        totalSalesVolume: Number(row?.total_sales_volume ?? 0),
      },
      performance: {
        queryDurationMs,
        optimization: "Indexed Subqueries on (users, inventory, transactions)",
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getDealersList(page = 1, limit = 10, search = "") {
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
        SELECT COUNT(DISTINCT u.id)::int AS total 
        FROM users u
        LEFT JOIN dealer_profiles dp ON dp.user_id = u.id
        WHERE u.role = 'dealer'
          AND (
            u.email ILIKE ${searchPattern}
            OR dp.display_name ILIKE ${searchPattern}
            OR u.id::text ILIKE ${searchPattern}
          );
      `;

      dataQuery = sql`
        SELECT 
          u.id AS dealer_id,
          u.email,
          u.is_active,
          u.is_email_verified,
          u.created_at,
          u.last_login_at,
          dp.display_name,
          dp.photo_url,
          dp.phone,
          NULL AS location,
          (
            SELECT COUNT(*)::int 
            FROM inventory inv 
            WHERE inv.user_id = u.id AND inv.listing_status IN ('listed', 'unlisted')
          ) AS inventory_count,
          (
            SELECT COALESCE(SUM(CASE WHEN inv.current_market_value > 0 THEN inv.current_market_value ELSE inv.cost_basis END), 0)::numeric
            FROM inventory inv 
            WHERE inv.user_id = u.id AND inv.listing_status IN ('listed', 'unlisted')
          ) AS inventory_value,
          (
            SELECT COUNT(*)::int 
            FROM transactions tx 
            WHERE tx.user_id = u.id AND tx.type = 'sell'
          ) AS sold_count,
          (
            SELECT COALESCE(SUM(tx.price), 0)::numeric
            FROM transactions tx 
            WHERE tx.user_id = u.id AND tx.type = 'sell'
          ) AS total_sales_volume
        FROM users u
        LEFT JOIN dealer_profiles dp ON dp.user_id = u.id
        WHERE u.role = 'dealer'
          AND (
            u.email ILIKE ${searchPattern}
            OR dp.display_name ILIKE ${searchPattern}
            OR u.id::text ILIKE ${searchPattern}
          )
        ORDER BY u.created_at DESC
        LIMIT ${safeLimit} OFFSET ${offset};
      `;
    } else {
      countQuery = sql`SELECT COUNT(*)::int AS total FROM users WHERE role = 'dealer';`;

      dataQuery = sql`
        SELECT 
          u.id AS dealer_id,
          u.email,
          u.is_active,
          u.is_email_verified,
          u.created_at,
          u.last_login_at,
          dp.display_name,
          dp.photo_url,
          dp.phone,
          NULL AS location,
          (
            SELECT COUNT(*)::int 
            FROM inventory inv 
            WHERE inv.user_id = u.id AND inv.listing_status IN ('listed', 'unlisted')
          ) AS inventory_count,
          (
            SELECT COALESCE(SUM(CASE WHEN inv.current_market_value > 0 THEN inv.current_market_value ELSE inv.cost_basis END), 0)::numeric
            FROM inventory inv 
            WHERE inv.user_id = u.id AND inv.listing_status IN ('listed', 'unlisted')
          ) AS inventory_value,
          (
            SELECT COUNT(*)::int 
            FROM transactions tx 
            WHERE tx.user_id = u.id AND tx.type = 'sell'
          ) AS sold_count,
          (
            SELECT COALESCE(SUM(tx.price), 0)::numeric
            FROM transactions tx 
            WHERE tx.user_id = u.id AND tx.type = 'sell'
          ) AS total_sales_volume
        FROM users u
        LEFT JOIN dealer_profiles dp ON dp.user_id = u.id
        WHERE u.role = 'dealer'
        ORDER BY u.created_at DESC
        LIMIT ${safeLimit} OFFSET ${offset};
      `;
    }

    const countResult = await db.execute<{ total: number }>(countQuery);
    const total = Number(countResult.rows[0]?.total ?? 0);

    const itemsResult = await db.execute<{
      dealer_id: string;
      email: string;
      is_active: boolean;
      is_email_verified: boolean;
      created_at: string;
      last_login_at: string | null;
      display_name: string | null;
      photo_url: string | null;
      phone: string | null;
      location: string | null;
      inventory_count: number;
      inventory_value: string;
      sold_count: number;
      total_sales_volume: string;
    }>(dataQuery);

    const queryDurationMs = Number((performance.now() - startTime).toFixed(2));
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));

    const dealers = itemsResult.rows.map((row) => ({
      id: row.dealer_id,
      email: row.email,
      displayName: row.display_name || row.email.split("@")[0],
      photoUrl: row.photo_url,
      phone: row.phone,
      location: row.location,
      isActive: Boolean(row.is_active),
      isEmailVerified: Boolean(row.is_email_verified),
      createdAt: row.created_at,
      lastLoginAt: row.last_login_at,
      metrics: {
        inventoryCount: Number(row.inventory_count ?? 0),
        inventoryValue: Number(row.inventory_value ?? 0),
        soldCount: Number(row.sold_count ?? 0),
        totalSalesVolume: Number(row.total_sales_volume ?? 0),
      },
    }));

    return {
      data: dealers,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
        search: cleanSearch,
      },
      performance: {
        queryDurationMs,
        optimization: cleanSearch ? "ILIKE Search on Dealer Profiles & Users" : "Correlated Subquery Index Scan on (users, inventory, transactions)",
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getDealerDetail(dealerId: string) {
    const startTime = performance.now();

    const dealerResult = await db.execute<{
      dealer_id: string;
      email: string;
      role: string;
      is_active: boolean;
      is_email_verified: boolean;
      created_at: string;
      last_login_at: string | null;
      display_name: string | null;
      photo_url: string | null;
      phone: string | null;
      location: string | null;
      inventory_count: number;
      inventory_value: string;
      sold_count: number;
      total_sales_volume: string;
      total_cost_basis: string;
    }>(sql`
      SELECT 
        u.id AS dealer_id,
        u.email,
        u.role,
        u.is_active,
        u.is_email_verified,
        u.created_at,
        u.last_login_at,
        dp.display_name,
        dp.photo_url,
        dp.phone,
        NULL AS location,
        (
          SELECT COUNT(*)::int 
          FROM inventory inv 
          WHERE inv.user_id = u.id AND inv.listing_status IN ('listed', 'unlisted')
        ) AS inventory_count,
        (
          SELECT COALESCE(SUM(CASE WHEN inv.current_market_value > 0 THEN inv.current_market_value ELSE inv.cost_basis END), 0)::numeric
          FROM inventory inv 
          WHERE inv.user_id = u.id AND inv.listing_status IN ('listed', 'unlisted')
        ) AS inventory_value,
        (
          SELECT COUNT(*)::int 
          FROM transactions tx 
          WHERE tx.user_id = u.id AND tx.type = 'sell'
        ) AS sold_count,
        (
          SELECT COALESCE(SUM(tx.price), 0)::numeric
          FROM transactions tx 
          WHERE tx.user_id = u.id AND tx.type = 'sell'
        ) AS total_sales_volume,
        (
          SELECT COALESCE(SUM(tx.cost_basis), 0)::numeric
          FROM transactions tx 
          WHERE tx.user_id = u.id AND tx.type = 'sell'
        ) AS total_cost_basis
      FROM users u
      LEFT JOIN dealer_profiles dp ON dp.user_id = u.id
      WHERE u.id = ${dealerId}
      LIMIT 1;
    `);

    const row = dealerResult.rows[0];
    if (!row) {
      throw new Error("Dealer not found");
    }

    const salesVol = Number(row.total_sales_volume ?? 0);
    const costBasis = Number(row.total_cost_basis ?? 0);
    const netProfit = salesVol - costBasis;

    const queryDurationMs = Number((performance.now() - startTime).toFixed(2));

    return {
      dealer: {
        id: row.dealer_id,
        email: row.email,
        role: row.role,
        displayName: row.display_name || row.email.split("@")[0],
        photoUrl: row.photo_url,
        phone: row.phone,
        location: row.location,
        isActive: Boolean(row.is_active),
        isEmailVerified: Boolean(row.is_email_verified),
        createdAt: row.created_at,
        lastLoginAt: row.last_login_at,
        metrics: {
          inventoryCount: Number(row.inventory_count ?? 0),
          inventoryValue: Number(row.inventory_value ?? 0),
          soldCount: Number(row.sold_count ?? 0),
          totalSalesVolume: salesVol,
          netProfit,
        },
      },
      performance: {
        queryDurationMs,
        optimization: "Indexed Primary Key Lookup on users",
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getDealerInventory(dealerId: string, page = 1, limit = 10, search = "") {
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
        LEFT JOIN players p ON p.id = inv.player_id
        LEFT JOIN cards c ON c.id = inv.card_id
        LEFT JOIN card_variants cv ON cv.id = inv.variant_id
        WHERE inv.user_id = ${dealerId}
          AND inv.listing_status IN ('listed', 'unlisted')
          AND (
            p.name ILIKE ${searchPattern}
            OR inv.set_name ILIKE ${searchPattern}
            OR c.set_name ILIKE ${searchPattern}
            OR inv.variation ILIKE ${searchPattern}
            OR inv.card_number ILIKE ${searchPattern}
            OR inv.grade_company ILIKE ${searchPattern}
            OR cv.name ILIKE ${searchPattern}
          );
      `;

      dataQuery = sql`
        SELECT 
          inv.id AS inventory_id,
          inv.user_id,
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
          inv.photos,
          inv.ebay_active_listings,
          cv.name AS variant_name,
          cv.is_parallel AS variant_is_parallel,
          cv.print_run AS variant_print_run,
          inv.added_at
        FROM inventory inv
        LEFT JOIN players p ON p.id = inv.player_id
        LEFT JOIN cards c ON c.id = inv.card_id
        LEFT JOIN card_variants cv ON cv.id = inv.variant_id
        WHERE inv.user_id = ${dealerId}
          AND inv.listing_status IN ('listed', 'unlisted')
          AND (
            p.name ILIKE ${searchPattern}
            OR inv.set_name ILIKE ${searchPattern}
            OR c.set_name ILIKE ${searchPattern}
            OR inv.variation ILIKE ${searchPattern}
            OR inv.card_number ILIKE ${searchPattern}
            OR inv.grade_company ILIKE ${searchPattern}
            OR cv.name ILIKE ${searchPattern}
          )
        ORDER BY inv.added_at DESC
        LIMIT ${safeLimit} OFFSET ${offset};
      `;
    } else {
      countQuery = sql`
        SELECT COUNT(*)::int AS total 
        FROM inventory 
        WHERE user_id = ${dealerId} AND listing_status IN ('listed', 'unlisted');
      `;

      dataQuery = sql`
        SELECT 
          inv.id AS inventory_id,
          inv.user_id,
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
          inv.photos,
          inv.ebay_active_listings,
          cv.name AS variant_name,
          cv.is_parallel AS variant_is_parallel,
          cv.print_run AS variant_print_run,
          inv.added_at
        FROM inventory inv
        LEFT JOIN players p ON p.id = inv.player_id
        LEFT JOIN cards c ON c.id = inv.card_id
        LEFT JOIN card_variants cv ON cv.id = inv.variant_id
        WHERE inv.user_id = ${dealerId} AND inv.listing_status IN ('listed', 'unlisted')
        ORDER BY inv.added_at DESC
        LIMIT ${safeLimit} OFFSET ${offset};
      `;
    }

    const countResult = await db.execute<{ total: number }>(countQuery);
    const total = Number(countResult.rows[0]?.total ?? 0);

    const itemsResult = await db.execute<{
      inventory_id: string;
      user_id: string;
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
      photos: string[] | null;
      ebay_active_listings: string | null;
      variant_name: string | null;
      variant_is_parallel: boolean | null;
      variant_print_run: number | null;
      added_at: string;
    }>(dataQuery);

    const queryDurationMs = Number((performance.now() - startTime).toFixed(2));
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));

    const items = itemsResult.rows.map((row) => {
      let imageUrl: string | null = null;
      if (row.photos && Array.isArray(row.photos) && row.photos.length > 0) {
        imageUrl = row.photos[0];
      } else if (row.ebay_active_listings) {
        try {
          const parsed = JSON.parse(row.ebay_active_listings);
          if (Array.isArray(parsed) && parsed.length > 0) {
            imageUrl = parsed[0]?.image?.imageUrl || parsed[0]?.image_url || null;
          }
        } catch {
          // ignore JSON parse error
        }
      }

      return {
        id: row.inventory_id,
        imageUrl,
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
        costBasis: row.cost_basis,
        currentMarketValue: row.current_market_value,
        quantity: row.quantity,
        listingStatus: row.listing_status,
        addedAt: row.added_at,
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
        optimization: "Indexed Scan on inventory (user_id, listing_status, added_at DESC)",
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getDealerSoldCards(dealerId: string, page = 1, limit = 10, search = "") {
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
        FROM transactions tx
        LEFT JOIN inventory inv ON inv.id = tx.inventory_id
        LEFT JOIN players p ON p.id = inv.player_id
        WHERE tx.user_id = ${dealerId}
          AND tx.type::text = 'sell'
          AND (
            tx.player_name ILIKE ${searchPattern}
            OR p.name ILIKE ${searchPattern}
            OR tx.channel::text ILIKE ${searchPattern}
          );
      `;

      dataQuery = sql`
        SELECT 
          tx.id AS transaction_id,
          tx.user_id,
          tx.inventory_id,
          COALESCE(tx.player_name, p.name, 'Sold Card') AS title,
          COALESCE(tx.player_name, p.name, 'Unknown Player') AS player_name,
          inv.year,
          inv.set_name,
          COALESCE(tx.grade_key, inv.grade_key, 'RAW') AS grade_key,
          tx.price::text AS sold_price,
          COALESCE(tx.cost_basis, inv.cost_basis, 0)::text AS cost_basis,
          COALESCE(tx.profit, 0)::text AS profit,
          COALESCE(tx.channel::text, 'In-Person') AS platform,
          tx.created_at AS sold_at,
          tx.card_snapshot,
          inv.photos,
          inv.ebay_sales_completed
        FROM transactions tx
        LEFT JOIN inventory inv ON inv.id = tx.inventory_id
        LEFT JOIN players p ON p.id = inv.player_id
        WHERE tx.user_id = ${dealerId}
          AND tx.type::text = 'sell'
          AND (
            tx.player_name ILIKE ${searchPattern}
            OR p.name ILIKE ${searchPattern}
            OR tx.channel::text ILIKE ${searchPattern}
          )
        ORDER BY tx.created_at DESC
        LIMIT ${safeLimit} OFFSET ${offset};
      `;
    } else {
      countQuery = sql`
        SELECT COUNT(*)::int AS total 
        FROM transactions 
        WHERE user_id = ${dealerId} AND type::text = 'sell';
      `;

      dataQuery = sql`
        SELECT 
          tx.id AS transaction_id,
          tx.user_id,
          tx.inventory_id,
          COALESCE(tx.player_name, p.name, 'Sold Card') AS title,
          COALESCE(tx.player_name, p.name, 'Unknown Player') AS player_name,
          inv.year,
          inv.set_name,
          COALESCE(tx.grade_key, inv.grade_key, 'RAW') AS grade_key,
          tx.price::text AS sold_price,
          COALESCE(tx.cost_basis, inv.cost_basis, 0)::text AS cost_basis,
          COALESCE(tx.profit, 0)::text AS profit,
          COALESCE(tx.channel::text, 'In-Person') AS platform,
          tx.created_at AS sold_at,
          tx.card_snapshot,
          inv.photos,
          inv.ebay_sales_completed
        FROM transactions tx
        LEFT JOIN inventory inv ON inv.id = tx.inventory_id
        LEFT JOIN players p ON p.id = inv.player_id
        WHERE tx.user_id = ${dealerId} AND tx.type::text = 'sell'
        ORDER BY tx.created_at DESC
        LIMIT ${safeLimit} OFFSET ${offset};
      `;
    }

    const countResult = await db.execute<{ total: number }>(countQuery);
    const total = Number(countResult.rows[0]?.total ?? 0);

    const itemsResult = await db.execute<{
      transaction_id: string;
      user_id: string;
      inventory_id: string | null;
      title: string;
      player_name: string | null;
      year: number | null;
      set_name: string | null;
      grade_key: string;
      sold_price: string;
      cost_basis: string;
      profit: string;
      platform: string | null;
      sold_at: string;
      card_snapshot: string | null;
      photos: string[] | null;
      ebay_sales_completed: string | null;
    }>(dataQuery);

    const queryDurationMs = Number((performance.now() - startTime).toFixed(2));
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));

    const items = itemsResult.rows.map((row) => {
      let imageUrl: string | null = null;
      if (row.photos && Array.isArray(row.photos) && row.photos.length > 0) {
        imageUrl = row.photos[0];
      } else if (row.card_snapshot) {
        try {
          const snapshot = typeof row.card_snapshot === "string" ? JSON.parse(row.card_snapshot) : row.card_snapshot;
          imageUrl = snapshot.imageUrl || snapshot.image_url || snapshot.photos?.[0] || null;
        } catch {}
      }
      if (!imageUrl && row.ebay_sales_completed) {
        try {
          const parsed = JSON.parse(row.ebay_sales_completed);
          if (Array.isArray(parsed) && parsed.length > 0) {
            imageUrl = parsed[0]?.image?.imageUrl || parsed[0]?.image_url || null;
          }
        } catch {}
      }

      return {
        id: row.transaction_id,
        imageUrl,
        title: row.title,
        playerName: row.player_name,
        year: row.year,
        setName: row.set_name,
        gradeKey: row.grade_key,
        soldPrice: row.sold_price,
        costBasis: row.cost_basis,
        profit: row.profit,
        platform: row.platform || "In-Person",
        soldAt: row.sold_at,
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
        optimization: "Indexed Scan on transactions (user_id, type, created_at DESC)",
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
    return await this.getDealersList(1, 10, "");
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
