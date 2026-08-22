import { sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { createHash } from "node:crypto";
import type { EbayService } from "./ebay.service.js";
import type { SoldCompsService } from "./sold-comps.service.js";
import type { MyslabsService, MyslabsItem } from "./myslabs.service.js";
import { normalizeCompsGradeKey } from "./comps-query.util.js";

const t500 = (s?: string | null) => s && s.length > 500 ? s.slice(0, 500) : (s || null);

export class ListingRepository {

  async getListings(userId: string) {
    const result = await db.execute(sql`
      SELECT * FROM inventory
      WHERE user_id = ${userId} AND listing_status = 'listed'
      ORDER BY updated_at DESC
    `);
    return result.rows;
  }

  async postListings(userId: string, body: any) {
    const { inventoryId, price, platforms } = body;
    const result = await db.execute(sql`
      UPDATE inventory
      SET listing_status = 'listed', current_market_value = ${price}, updated_at = NOW()
      WHERE id = ${inventoryId} AND user_id = ${userId}
      RETURNING *
    `);
    return { success: true, item: result.rows[0] };
  }

  async getListingsId(id: string) {
    const result = await db.execute(sql`
      SELECT * FROM inventory WHERE id = ${id} LIMIT 1
    `);
    return result.rows[0];
  }

  async patchListingsIdPrice(id: string, body: any) {
    const { price } = body;
    const result = await db.execute(sql`
      UPDATE inventory
      SET current_market_value = ${price}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `);
    return result.rows[0];
  }

  async deleteListingsId(id: string) {
    const result = await db.execute(sql`
      UPDATE inventory
      SET listing_status = 'unlisted', updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `);
    return { success: true, item: result.rows[0] };
  }

  async postListingsIdRelist(id: string) {
    const result = await db.execute(sql`
      UPDATE inventory
      SET listing_status = 'listed', updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `);
    return { success: true, item: result.rows[0] };
  }

  async getPriceComparison(inventoryId: string) {
    const result = await db.execute(sql`
      SELECT i.*, cv.id as variant_id, cv.name as variant_name
      FROM inventory i
      LEFT JOIN card_variants cv ON cv.id = i.variant_id
      WHERE i.id = ${inventoryId}
      LIMIT 1
    `);
    const item = result.rows[0] as any;
    if (!item) throw new Error("Inventory item not found");

    const comps = await db.execute(sql`
      SELECT * FROM card_comp_snapshots
      WHERE variant_id = ${item.variant_id}
      ORDER BY fetched_at DESC
      LIMIT 5
    `);
    return { item, comps: comps.rows };
  }

  async getFeeCalculator(query: any) {
    const { price = 0, platform = "ebay" } = query;
    const pVal = Number(price);
    let fee = 0;
    if (platform === "ebay") {
      fee = pVal * 0.1325 + 0.30;
    } else if (platform === "tcgplayer") {
      fee = pVal * 0.1025 + 0.30;
    } else {
      fee = pVal * 0.029 + 0.30;
    }
    return { price: pVal, platform, fee, payout: pVal - fee };
  }

  async generateContent(body: any) {
    const { title = "" } = body;
    return {
      title: `🔥 MINT ${title} 🔥`,
      description: `Up for sale is a beautiful ${title} in excellent condition. Perfect addition to any sports card collection. Ships securely in sleeve and top loader.`
    };
  }

  async getAnalytics(userId: string) {
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) as active_listings,
        COALESCE(SUM(current_market_value), 0) as total_listed_value
      FROM inventory
      WHERE user_id = ${userId} AND listing_status = 'listed'
    `);
    return result.rows[0];
  }

  async ebaySold(params: any, ebayService: EbayService, soldCompsService: SoldCompsService) {
    const { q, limit, offset, variant_id, grade_key, filter, sold_q, forceRefresh } = params;
    const maxResults = limit ? Number(limit) : 20;
    const offsetNum = offset ? Number(offset) : 0;
    const query = q.trim();
    const queryForSold = sold_q ? sold_q.trim() : query;
    const gradeKey = normalizeCompsGradeKey(grade_key) || "RAW";

    let effectiveVariantId = variant_id?.trim();

    if (!effectiveVariantId && query) {
      const found = await db.execute(sql`
        SELECT cv.id 
        FROM card_variants cv
        JOIN cards c ON c.id = cv.card_id
        JOIN players p ON p.id = c.player_id
        WHERE (p.name || ' ' || c.year || ' ' || c.set_name || ' ' || COALESCE(cv.name, 'Base')) ILIKE ${'%' + query + '%'}
        LIMIT 1
      `);
      if (found.rows.length > 0) {
        effectiveVariantId = (found.rows[0] as any).id;
      }
    }

    if (effectiveVariantId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(effectiveVariantId);
      if (isUuid) {
        const exists = await db.execute(sql`
          SELECT id FROM card_variants WHERE id = ${effectiveVariantId} LIMIT 1
        `);
        if (exists.rows.length === 0) {
          effectiveVariantId = undefined;
        }
      } else {
        effectiveVariantId = undefined;
      }
    }

    if (effectiveVariantId && !forceRefresh) {
      const cached = await db.execute(sql`
        SELECT
          id, variant_id, grade_key, platform, avg_sold_price, last_sold_price, lowest_active, sales_count_30d, fetched_at
        FROM card_comp_snapshots
        WHERE variant_id = ${effectiveVariantId}
          AND platform = 'ebay'
          AND grade_key = ${gradeKey}
          AND fetched_at >= NOW() - INTERVAL '24 hours'
        ORDER BY fetched_at DESC
        LIMIT 10
      `);

      if (cached.rows.length > 0) {
        const rows = cached.rows as any[];
        const soldCached = await db.execute(sql`
          SELECT
            platform_item_id, sold_price, sold_at, title, condition, grade_key
          FROM platform_sold_listings
          WHERE variant_id = ${effectiveVariantId}
            AND platform = 'ebay'
            AND grade_key = ${gradeKey}
          ORDER BY sold_at DESC
          LIMIT ${maxResults} OFFSET ${offsetNum}
        `);

        const mappedSold = (soldCached.rows as any[]).map((item) => ({
          itemId: item.platform_item_id,
          title: item.title,
          soldPrice: { value: item.sold_price, currency: "USD" },
          condition: item.condition || "Used",
          endDate: item.sold_at instanceof Date ? item.sold_at.toISOString() : new Date(item.sold_at).toISOString(),
          shippingCost: "0.00",
          itemWebUrl: `https://www.ebay.com/itm/${item.platform_item_id}`,
          grade_key: item.grade_key || "RAW",
        }));

        const activeCached = await db.execute(sql`
          SELECT
            platform_item_id, price, title, condition, item_web_url, image_url, grade_key
          FROM platform_active_listings
          WHERE variant_id = ${effectiveVariantId}
            AND platform = 'ebay'
            AND grade_key = ${gradeKey}
            AND last_seen_at >= NOW() - INTERVAL '24 hours'
          ORDER BY price ASC
          LIMIT ${maxResults} OFFSET ${offsetNum}
        `);

        const mappedActive = (activeCached.rows as any[]).map((item) => ({
          itemId: item.platform_item_id,
          title: item.title,
          price: { value: item.price, currency: "USD" },
          condition: item.condition || "Used",
          itemWebUrl: item.item_web_url,
          image: { imageUrl: item.image_url },
          grade_key: item.grade_key || "RAW",
        }));

        console.log(`[COMPS] ✅ Returning comps from DB CACHE for: ${query}`);
        return {
          query,
          fromCache: true,
          fetchedAt: rows[0].fetched_at instanceof Date ? rows[0].fetched_at.toISOString() : new Date(rows[0].fetched_at).toISOString(),
          snapshots: rows.map((r) => ({
            platform: r.platform,
            avgSoldPrice: r.avg_sold_price,
            lastSoldPrice: r.last_sold_price,
            lowestActive: r.lowest_active,
            salesCount30d: r.sales_count_30d,
            priceTrend30d: null,
          })),
          activeListings: mappedActive,
          last7Days: {
            items: mappedSold.slice(0, Math.min(maxResults, 10)),
            totalEntries: mappedSold.length,
            period: "7d",
          },
          last30Days: {
            items: mappedSold,
            totalEntries: mappedSold.length,
            period: "30d",
          },
        };
      }
    }

    // Secondary DB Fallback: Check platform_sold_listings by query matching if variant cache didn't hit
    if (!forceRefresh && query) {
      const dbSoldFallback = await db.execute(sql`
        SELECT platform_item_id, sold_price, sold_at, title, condition, grade_key
        FROM platform_sold_listings
        WHERE platform = 'ebay'
          AND (title ILIKE ${'%' + queryForSold + '%'} OR title ILIKE ${'%' + query + '%'})
        ORDER BY sold_at DESC
        LIMIT ${maxResults} OFFSET ${offsetNum}
      `);

      if (dbSoldFallback.rows.length >= 3) {
        const mappedSold = (dbSoldFallback.rows as any[]).map((item) => ({
          itemId: item.platform_item_id,
          title: item.title,
          soldPrice: { value: item.sold_price, currency: "USD" },
          condition: item.condition || "Used",
          endDate: item.sold_at instanceof Date ? item.sold_at.toISOString() : new Date(item.sold_at).toISOString(),
          shippingCost: "0.00",
          itemWebUrl: `https://www.ebay.com/itm/${item.platform_item_id}`,
          grade_key: item.grade_key || "RAW",
        }));

        console.log(`[COMPS] ✅ Returning ${mappedSold.length} sold comps from DB FALLBACK for: "${query}"`);
        return {
          query,
          fromCache: true,
          fetchedAt: new Date().toISOString(),
          snapshots: [],
          activeListings: [],
          last7Days: {
            items: mappedSold.slice(0, Math.min(maxResults, 10)),
            totalEntries: mappedSold.length,
            period: "7d",
          },
          last30Days: {
            items: mappedSold,
            totalEntries: mappedSold.length,
            period: "30d",
          },
        };
      }
    }

    let latestSoldAt: Date | null = null;
    if (effectiveVariantId) {
      const latestRes = await db.execute(sql`
        SELECT MAX(sold_at) as latest_sold_at
        FROM platform_sold_listings
        WHERE variant_id = ${effectiveVariantId}
          AND grade_key = ${gradeKey}
      `);
      if (latestRes.rows.length > 0 && (latestRes.rows[0] as any).latest_sold_at) {
        latestSoldAt = new Date((latestRes.rows[0] as any).latest_sold_at);
        console.log(`[COMPS] 🕒 Latest stored sold_at for variant ${effectiveVariantId} (${gradeKey}): ${latestSoldAt.toISOString()}`);
      }
    }

    console.log(`\n======================================================`);
    console.log(`[COMPS] 📡 Fetching LIVE comps for eBay...`);
    console.log(`[COMPS]  👉 Passing to Active Listings (Real eBay API): "${query}"`);
    console.log(`[COMPS]  👉 Passing to Sold Comps API (Delta Min: ${latestSoldAt ? latestSoldAt.toISOString() : 'NONE'}): "${queryForSold}"`);
    console.log(`======================================================\n`);
    const ebayActiveStartTime = Date.now();
    const soldCompsStartTime = Date.now();
    
    const [soldResult, activeResult] = await Promise.allSettled([
      soldCompsService.getAllPagesSoldItems(queryForSold, { minSoldAt: latestSoldAt }).finally(() => {
        const duration = Date.now() - soldCompsStartTime;
        console.log(`[PERF] ⏱️ Sold Comps API (Multi-Page Delta Sold) took ${duration}ms`);
      }),
      ebayService.searchListings({
        q: query,
        limit: Math.min(maxResults, 50),
        offset: offsetNum,
        sort: "pricePlusShippingLowest",
      }).finally(() => {
        const duration = Date.now() - ebayActiveStartTime;
        console.log(`[PERF] ⏱️ Real eBay API (Active) took ${duration}ms`);
      }),
    ]);

    const soldData = soldResult.status === "fulfilled"
      ? soldResult.value
      : { keyword: query, totalItems: 0, hasNextPage: false, items: [] };

    if (soldResult.status === "rejected") {
      console.warn("Failed to fetch sold comps from soldCompsService:", soldResult.reason?.message || soldResult.reason);
    }

    const activeData = activeResult.status === "fulfilled"
      ? activeResult.value
      : { total: 0, itemSummaries: [] };

    // Universal Grade Filter: Ensures RAW tab has NO graded cards, and numeric grade tabs (10, 9.5, 9, etc.) match their respective grade
    const matchesGrade = (title?: string | null, targetGrade?: string): boolean => {
      if (!title) return false;
      if (!targetGrade || targetGrade === "RAW") {
        return !/\b(PSA|BGS|SGC|CGC|CSG|TAG|HGA|GMA|KSA|WCG)\b|\b(Slab|Slabbed|Graded)\b/i.test(title);
      }

      const escapedGrade = targetGrade.replace('.', '\\.');
      if (targetGrade === "10") {
        const grade10Regex = new RegExp(`\\b(PSA|BGS|SGC|CGC|CSG|TAG|HGA|GMA|KSA|WCG|GRADE|GRADED)?\\s*(:|-|\\s)?\\s*(10|GEM\\s*MINT|GEM-MT)\\b`, "i");
        return grade10Regex.test(title);
      }

      const numericGradeRegex = new RegExp(`\\b(PSA|BGS|SGC|CGC|CSG|TAG|HGA|GMA|KSA|WCG|GRADE|GRADED)?\\s*(:|-|\\s)?\\s*${escapedGrade}\\b`, "i");
      return numericGradeRegex.test(title);
    };

    // Quality Title Filter: Rejects noise (lots, presales, reprints) and handles Base vs Specific Variant matching
    const isValidListingTitle = (title?: string | null): boolean => {
      if (!title) return false;
      // Filter out lots, presales, reprints
      if (/\b(lot|bundle|presale|pre-sale|custom|reprint)\b/i.test(title) && !/\bbase set\b/i.test(title)) {
        return false;
      }
      
      const parallelKeywords = [
        "refractor", "silver", "pink", "red", "blue", "gold", "green", "purple", 
        "orange", "ice", "mojo", "wave", "cracked", "auto", "autograph", "patch", "jersey", "ruby", "hyper", "velocity", "pulsar"
      ];

      // If query specifies Base card, filter out parallel keywords
      if (/\bbase\b/i.test(query)) {
        const parallelRegex = new RegExp(`\\b(${parallelKeywords.join("|")})\\b`, "i");
        if (parallelRegex.test(title)) return false;
      } else {
        // If query specifies a specific variant (e.g. "Silver" or "Green"), ensure title matches that variant
        for (const kw of parallelKeywords) {
          if (new RegExp(`\\b${kw}\\b`, "i").test(query)) {
            if (!new RegExp(`\\b${kw}\\b`, "i").test(title)) return false;
          }
        }
      }
      return true;
    };

    if (activeData.itemSummaries && Array.isArray(activeData.itemSummaries)) {
      activeData.itemSummaries = activeData.itemSummaries.filter(item => 
        matchesGrade(item.title, gradeKey) && isValidListingTitle(item.title)
      );
    }
    if (soldData.items && Array.isArray(soldData.items)) {
      soldData.items = soldData.items.filter(item => 
        matchesGrade(item.title, gradeKey) && isValidListingTitle(item.title)
      );
    }

    console.log(`\n======================================================`);
    console.log(`[EBAY_SOLD_COMPS] 🔍 Search String Passed: "${queryForSold}"`);
    console.log(`[EBAY_SOLD_COMPS] 📊 Total Items Across All Pages: ${soldData.items?.length || 0}`);
    console.log(`======================================================\n`);

    const prices = soldData.items
      .map((i) => parseFloat(i.soldPrice))
      .filter((p) => p > 0);
    const activePrices = (activeData.itemSummaries ?? [])
      .map((i) => parseFloat(i.price?.value ?? "0"))
      .filter((p) => p > 0);

    const avg = prices.length
      ? prices.reduce((a, b) => a + b, 0) / prices.length
      : 0;
    const last = prices.length ? prices[0] : 0;
    const lowest = activePrices.length ? Math.min(...activePrices) : 0;

    // High-performance DB persistence using multi-row SQL batch inserts
    if (effectiveVariantId) {
      await db.execute(sql`
        INSERT INTO card_comp_snapshots
          (id, variant_id, grade_key, platform, avg_sold_price, last_sold_price, lowest_active, sales_count_30d, fetched_at)
        VALUES
          (gen_random_uuid(), ${effectiveVariantId}, ${gradeKey}, 'ebay', ${avg.toFixed(2)}, ${last.toFixed(2)}, ${lowest.toFixed(2)}, ${prices.length}, NOW())
        ON CONFLICT (variant_id, grade_key, platform)
        DO UPDATE SET
          avg_sold_price = EXCLUDED.avg_sold_price,
          last_sold_price = EXCLUDED.last_sold_price,
          lowest_active = EXCLUDED.lowest_active,
          sales_count_30d = EXCLUDED.sales_count_30d,
          fetched_at = NOW()
      `);

      // Multi-row Bulk Insert for platform_sold_listings in chunks of 50
      const soldItems = soldData.items;
      const CHUNK_SIZE = 50;
      for (let i = 0; i < soldItems.length; i += CHUNK_SIZE) {
        const chunk = soldItems.slice(i, i + CHUNK_SIZE);
        const valueSqls = chunk.map((item) => {
          const itemGrade = (item as any).grade_key || gradeKey;
          const contentHash = createHash("sha256")
            .update(`soldcomps:${effectiveVariantId}:${itemGrade}:${item.url || item.itemId}:${item.endedAt}`)
            .digest("hex")
            .slice(0, 64);
          
          const priceVal = parseFloat(item.soldPrice) || 0;
          const soldAtVal = item.endedAt ? new Date(item.endedAt) : new Date();

          return sql`(gen_random_uuid(), ${effectiveVariantId}, ${itemGrade}, 'ebay', ${priceVal}, ${item.itemId || null}, ${soldAtVal}, ${t500(item.title) || null}, ${item.itemCondition || "Used"}, ${contentHash}, NOW())`;
        });

        if (valueSqls.length > 0) {
          await db.execute(sql`
            INSERT INTO platform_sold_listings
              (id, variant_id, grade_key, platform, sold_price, platform_item_id, sold_at, title, condition, content_hash, created_at)
            VALUES ${sql.join(valueSqls, sql`, `)}
            ON CONFLICT (content_hash) DO NOTHING
          `);
        }
      }

      // Clear out previous active listings for this card variant + grade + platform before inserting fresh active listings
      await db.execute(sql`
        DELETE FROM platform_active_listings
        WHERE variant_id = ${effectiveVariantId}
          AND grade_key = ${gradeKey}
          AND platform = 'ebay'
      `);

      // Multi-row Bulk Insert for platform_active_listings in chunks of 50
      const activeSummaries = activeData.itemSummaries ?? [];
      for (let i = 0; i < activeSummaries.length; i += CHUNK_SIZE) {
        const chunk = activeSummaries.slice(i, i + CHUNK_SIZE);
        const valueSqls = chunk.map((item) => {
          const itemGrade = (item as any).grade_key || gradeKey;
          const contentHash = createHash("sha256")
            .update(`ebayactive:${effectiveVariantId}:${itemGrade}:${item.itemId}`)
            .digest("hex")
            .slice(0, 64);

          const priceVal = parseFloat(item.price?.value ?? "0") || 0;

          return sql`(gen_random_uuid(), ${effectiveVariantId}, ${itemGrade}, 'ebay', ${priceVal}, ${item.itemId || null}, ${t500(item.title) || null}, ${item.condition || null}, ${t500(item.itemWebUrl) || null}, ${t500(item.image?.imageUrl) || null}, ${contentHash}, NOW(), NOW())`;
        });

        if (valueSqls.length > 0) {
          await db.execute(sql`
            INSERT INTO platform_active_listings
              (id, variant_id, grade_key, platform, price, platform_item_id, title, condition, item_web_url, image_url, content_hash, last_seen_at, created_at)
            VALUES ${sql.join(valueSqls, sql`, `)}
            ON CONFLICT (content_hash) DO UPDATE SET price = EXCLUDED.price, last_seen_at = NOW()
          `);
        }
      }
    }

    const mappedSold = soldData.items.map((item) => ({
      itemId: item.itemId,
      title: item.title,
      soldPrice: { value: item.soldPrice, currency: item.soldCurrency },
      condition: item.itemCondition || "Used",
      endDate: item.endedAt,
      shippingCost: item.shippingPrice || "0.00",
      itemWebUrl: item.url,
      image: { imageUrl: (item as any).thumbnailUrl || (item as any).fullResThumbnailUrl || (item as any).image?.imageUrl },
      grade_key: (item as any).grade_key || gradeKey
    }));

    const snapshot = {
      platform: "ebay",
      avgSoldPrice: avg.toFixed(2),
      lastSoldPrice: last.toFixed(2),
      lowestActive: lowest.toFixed(2),
      salesCount30d: prices.length,
      priceTrend30d: null,
    };

    console.log(`[COMPS] ✅ Returning LIVE comps from eBay APIs for: ${query}`);
    return {
      query,
      fromCache: false,
      snapshots: [snapshot],
      activeListings: (activeData.itemSummaries ?? []).map((item) => ({
        itemId: item.itemId,
        title: item.title,
        price: item.price,
        condition: item.condition || "Used",
        itemWebUrl: item.itemWebUrl,
        image: item.image,
        grade_key: (item as any).grade_key || gradeKey
      })),
      last7Days: {
        items: mappedSold.slice(0, Math.min(maxResults, 10)),
        totalEntries: mappedSold.length,
        period: "7d",
      },
      last30Days: {
        items: mappedSold.slice(0, maxResults),
        totalEntries: mappedSold.length,
        period: "30d",
      },
    };
  }

  async myslabsSold(params: any, myslabsService: MyslabsService) {
    const { q, limit, offset, variant_id, grade_key, filter, sold_q, forceRefresh } = params;
    const maxResults = limit ? Number(limit) : 20;
    const offsetNum = offset ? Number(offset) : 0;
    const query = q.trim();
    const queryForSold = sold_q ? sold_q.trim() : query;
    const gradeKey = normalizeCompsGradeKey(grade_key) || "RAW";

    let effectiveVariantId = variant_id?.trim();

    if (!effectiveVariantId && query) {
      const found = await db.execute(sql`
        SELECT cv.id 
        FROM card_variants cv
        JOIN cards c ON c.id = cv.card_id
        JOIN players p ON p.id = c.player_id
        WHERE (p.name || ' ' || c.year || ' ' || c.set_name || ' ' || COALESCE(cv.name, 'Base')) ILIKE ${'%' + query + '%'}
        LIMIT 1
      `);
      if (found.rows.length > 0) {
        effectiveVariantId = (found.rows[0] as any).id;
      }
    }

    if (effectiveVariantId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(effectiveVariantId);
      if (isUuid) {
        const exists = await db.execute(sql`
          SELECT id FROM card_variants WHERE id = ${effectiveVariantId} LIMIT 1
        `);
        if (exists.rows.length === 0) {
          effectiveVariantId = undefined;
        }
      } else {
        effectiveVariantId = undefined;
      }
    }

    if (effectiveVariantId && offsetNum === 0 && !forceRefresh) {
      const cached = await db.execute(sql`
        SELECT
          id, variant_id, grade_key, platform, avg_sold_price, last_sold_price, lowest_active, sales_count_30d, fetched_at
        FROM card_comp_snapshots
        WHERE variant_id = ${effectiveVariantId}
          AND grade_key = ${gradeKey}
          AND platform = 'myslabs'
          AND fetched_at >= NOW() - INTERVAL '24 hours'
        ORDER BY fetched_at DESC
        LIMIT 10
      `);

      if (cached.rows.length > 0) {
        const rows = cached.rows as any[];
        const soldCached = await db.execute(sql`
          SELECT
            platform_item_id, sold_price, sold_at, title, condition
          FROM platform_sold_listings
          WHERE variant_id = ${effectiveVariantId}
            AND grade_key = ${gradeKey}
            AND platform = 'myslabs'
          ORDER BY sold_at DESC
          LIMIT ${maxResults}
        `);

        const mappedSold = (soldCached.rows as any[]).map((item) => ({
          itemId: item.platform_item_id,
          title: item.title,
          soldPrice: { value: item.sold_price, currency: "USD" },
          condition: item.condition || "Used",
          endDate: item.sold_at instanceof Date ? item.sold_at.toISOString() : new Date(item.sold_at).toISOString(),
          shippingCost: "0.00",
          itemWebUrl: `https://myslabs.com/slab/view/${item.platform_item_id}`,
        }));

        const activeCached = await db.execute(sql`
          SELECT
            platform_item_id, price, title, condition, item_web_url, image_url
          FROM platform_active_listings
          WHERE variant_id = ${effectiveVariantId}
            AND grade_key = ${gradeKey}
            AND platform = 'myslabs'
            AND last_seen_at >= NOW() - INTERVAL '24 hours'
          ORDER BY price ASC
          LIMIT ${maxResults}
        `);

        const mappedActive = (activeCached.rows as any[]).map((item) => ({
          itemId: item.platform_item_id,
          title: item.title,
          price: { value: item.price, currency: "USD" },
          condition: item.condition || "Used",
          itemWebUrl: item.item_web_url,
          image: { imageUrl: item.image_url },
        }));


        return {
          query,
          fromCache: true,
          fetchedAt: rows[0].fetched_at instanceof Date ? rows[0].fetched_at.toISOString() : new Date(rows[0].fetched_at).toISOString(),
          snapshots: rows.map((r) => ({
            platform: r.platform,
            avgSoldPrice: r.avg_sold_price,
            lastSoldPrice: r.last_sold_price,
            lowestActive: r.lowest_active,
            salesCount30d: r.sales_count_30d,
            priceTrend30d: r.price_trend_30d,
          })),
          activeListings: mappedActive,
          last7Days: {
            items: mappedSold.slice(0, Math.min(maxResults, 10)),
            totalEntries: mappedSold.length,
            period: "7d",
          },
          last30Days: {
            items: mappedSold,
            totalEntries: mappedSold.length,
            period: "30d",
          },
        };
      }
    }

    // Secondary DB Fallback for MySlabs
    if (!forceRefresh && query) {
      const dbMySlabsFallback = await db.execute(sql`
        SELECT platform_item_id, sold_price, sold_at, title, condition
        FROM platform_sold_listings
        WHERE platform = 'myslabs'
          AND (title ILIKE ${'%' + queryForSold + '%'} OR title ILIKE ${'%' + query + '%'})
        ORDER BY sold_at DESC
        LIMIT ${maxResults}
      `);

      if (dbMySlabsFallback.rows.length >= 2) {
        const mappedSold = (dbMySlabsFallback.rows as any[]).map((item) => ({
          itemId: item.platform_item_id,
          title: item.title,
          soldPrice: { value: item.sold_price, currency: "USD" },
          condition: item.condition || "Used",
          endDate: item.sold_at instanceof Date ? item.sold_at.toISOString() : new Date(item.sold_at).toISOString(),
          shippingCost: "0.00",
          itemWebUrl: `https://myslabs.com/slab/view/${item.platform_item_id}`,
        }));

        console.log(`[COMPS] ✅ Returning ${mappedSold.length} MySlabs comps from DB FALLBACK for: "${query}"`);
        return {
          query,
          fromCache: true,
          fetchedAt: new Date().toISOString(),
          snapshots: [],
          activeListings: [],
          last7Days: {
            items: mappedSold.slice(0, Math.min(maxResults, 10)),
            totalEntries: mappedSold.length,
            period: "7d",
          },
          last30Days: {
            items: mappedSold,
            totalEntries: mappedSold.length,
            period: "30d",
          },
        };
      }
    }

    console.log(`\n======================================================`);
    console.log(`[COMPS] 📡 Fetching LIVE comps from MySlabs APIs...`);
    console.log(`[COMPS]  👉 Passing to MySlabs Active Listings API: "${query}"`);
    console.log(`[COMPS]  👉 Passing to MySlabs Sold API: "${queryForSold}"`);
    console.log(`======================================================\n`);
    const myslabsStartTime = Date.now();
    let soldData: { items: MyslabsItem[] } = { items: [] };
    let activeData: { items: MyslabsItem[] } = { items: [] };

    try {
      const fetchMySlabs = async (soldSearchQuery: string, activeSearchQuery: string) => {
        return Promise.all([
          myslabsService.searchSlabs({ q: soldSearchQuery, status: "sold", limit: maxResults }),
          myslabsService.searchSlabs({ q: activeSearchQuery, status: "for-sale", limit: maxResults })
        ]);
      };

      [soldData, activeData] = await fetchMySlabs(queryForSold, query);
      
      // Fallback 1: Remove special characters and abbreviations
      if (soldData.items.length === 0 && activeData.items.length === 0) {
        let cleanQuery = query.replace(/[^a-zA-Z0-9\s]/g, ' ')
                              .replace(/\b(Ref\.|Refractor|PSA|BGS|SGC)\b/gi, '')
                              .replace(/\s+/g, ' ').trim();
                              
        if (cleanQuery !== query && cleanQuery.length > 3) {
          console.log(`[COMPS] 📡 MySlabs strict search returned 0. Falling back to clean: ${cleanQuery}`);
          [soldData, activeData] = await fetchMySlabs(cleanQuery, cleanQuery);
        }

        // Fallback 2: Just the first 4 words (Player Name + Year)
        if (soldData.items.length === 0 && activeData.items.length === 0) {
          const shortQuery = cleanQuery.split(' ').slice(0, 4).join(' ');
          if (shortQuery !== cleanQuery && shortQuery.length > 5) {
            console.log(`[COMPS] 📡 MySlabs clean search returned 0. Falling back to short: ${shortQuery}`);
            [soldData, activeData] = await fetchMySlabs(shortQuery, shortQuery);
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch MySlabs LIVE comps:", e);
    }
    
    const matchesGradeMySlabs = (title?: string | null, targetGrade?: string): boolean => {
      if (!title) return false;
      if (!targetGrade || targetGrade === "RAW") {
        return !/\b(PSA|BGS|SGC|CGC|CSG|TAG|HGA|GMA|KSA|WCG)\b|\b(Slab|Slabbed|Graded)\b/i.test(title);
      }
      const escapedGrade = targetGrade.replace('.', '\\.');
      if (targetGrade === "10") {
        return /\b(PSA|BGS|SGC|CGC|CSG|TAG|HGA|GMA|KSA|WCG|GRADE|GRADED)?\s*(:|-|\s)?\s*(10|GEM\s*MINT|GEM-MT)\b/i.test(title);
      }
      return new RegExp(`\\b(PSA|BGS|SGC|CGC|CSG|TAG|HGA|GMA|KSA|WCG|GRADE|GRADED)?\\s*(:|-|\\s)?\\s*${escapedGrade}\\b`, "i").test(title);
    };

    const isValidMySlabsTitle = (title?: string | null): boolean => {
      if (!title) return false;
      if (/\b(lot|bundle|presale|pre-sale|custom|reprint)\b/i.test(title) && !/\bbase set\b/i.test(title)) {
        return false;
      }
      const parallelKeywords = [
        "refractor", "silver", "pink", "red", "blue", "gold", "green", "purple", 
        "orange", "ice", "mojo", "wave", "cracked", "auto", "autograph", "patch", "jersey", "ruby", "hyper", "velocity", "pulsar"
      ];
      if (/\bbase\b/i.test(query)) {
        const parallelRegex = new RegExp(`\\b(${parallelKeywords.join("|")})\\b`, "i");
        if (parallelRegex.test(title)) return false;
      } else {
        for (const kw of parallelKeywords) {
          if (new RegExp(`\\b${kw}\\b`, "i").test(query)) {
            if (!new RegExp(`\\b${kw}\\b`, "i").test(title)) return false;
          }
        }
      }
      return true;
    };

    if (activeData.items && Array.isArray(activeData.items)) {
      activeData.items = activeData.items.filter(item => 
        matchesGradeMySlabs(item.title, gradeKey) && isValidMySlabsTitle(item.title)
      );
    }
    if (soldData.items && Array.isArray(soldData.items)) {
      soldData.items = soldData.items.filter(item => 
        matchesGradeMySlabs(item.title, gradeKey) && isValidMySlabsTitle(item.title)
      );
    }

    console.log(`\n======================================================`);
    console.log(`[MYSLABS_SOLD_COMPS] 🔍 Search String Passed: "${queryForSold}"`);
    console.log(`[MYSLABS_SOLD_COMPS] 📊 Count of Items Returned: ${soldData.items?.length || 0}`);
    console.log(`[MYSLABS_SOLD_COMPS] 📦 Data Array (JSON):`, JSON.stringify(soldData.items || []));
    console.log(`======================================================\n`);

    console.log(`\n======================================================`);
    console.log(`[MYSLABS_ACTIVE_SEARCH] 🔍 Search String Passed: "${query}"`);
    console.log(`[MYSLABS_ACTIVE_SEARCH] 📊 Count of Items Returned: ${activeData.items?.length || 0}`);
    console.log(`[MYSLABS_ACTIVE_SEARCH] 📦 Data Array (JSON):`, JSON.stringify(activeData.items || []));
    console.log(`======================================================\n`);

    const prices = soldData.items.map((i) => i.price).filter((p) => p > 0);
    const activePrices = activeData.items.map((i) => i.price).filter((p) => p > 0);

    const avg = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const last = prices.length ? prices[0] : 0;
    const lowest = activePrices.length ? Math.min(...activePrices) : 0;

    if (effectiveVariantId) {
      await db.execute(sql`
        INSERT INTO card_comp_snapshots
          (id, variant_id, grade_key, platform, avg_sold_price, last_sold_price, lowest_active, sales_count_30d, fetched_at)
        VALUES
          (gen_random_uuid(), ${effectiveVariantId}, ${gradeKey}, 'myslabs', ${avg.toFixed(2)}, ${last.toFixed(2)}, ${lowest.toFixed(2)}, ${prices.length}, NOW())
        ON CONFLICT (variant_id, grade_key, platform)
        DO UPDATE SET
          avg_sold_price = EXCLUDED.avg_sold_price,
          last_sold_price = EXCLUDED.last_sold_price,
          lowest_active = EXCLUDED.lowest_active,
          sales_count_30d = EXCLUDED.sales_count_30d,
          fetched_at = NOW()
      `);

      for (const item of soldData.items) {
        const endedAtStr = item.sold_date || new Date().toISOString();
        const itemGrade = item.grade ? String(item.grade) : "RAW";
        const contentHash = createHash("sha256")
          .update(`myslabssold:${effectiveVariantId}:${itemGrade}:${item.id}:${endedAtStr}`)
          .digest("hex")
          .slice(0, 64);

        await db.execute(sql`
          INSERT INTO platform_sold_listings
            (id, variant_id, grade_key, platform, sold_price, platform_item_id, sold_at, title, condition, content_hash, created_at)
          VALUES
            (gen_random_uuid(), ${effectiveVariantId}, ${itemGrade}, 'myslabs', ${item.price}, ${item.id.toString()}, ${endedAtStr}, ${t500(item.title)}, ${item.grade ? `Grade ${item.grade}` : "Slabbed"}, ${contentHash}, NOW())
          ON CONFLICT (content_hash) DO NOTHING
        `);
      }

      // Clear out previous active listings for this card variant + grade + platform before inserting fresh active listings
      await db.execute(sql`
        DELETE FROM platform_active_listings
        WHERE variant_id = ${effectiveVariantId}
          AND grade_key = ${gradeKey}
          AND platform = 'myslabs'
      `);

      for (const item of activeData.items ?? []) {
        const itemGrade = item.grade ? String(item.grade) : "RAW";
        const contentHash = createHash("sha256")
          .update(`myslabsactive:${effectiveVariantId}:${itemGrade}:${item.id}`)
          .digest("hex")
          .slice(0, 64);
        
        await db.execute(sql`
          INSERT INTO platform_active_listings
            (id, variant_id, grade_key, platform, price, platform_item_id, title, condition, item_web_url, image_url, content_hash, last_seen_at, created_at)
          VALUES
            (gen_random_uuid(), ${effectiveVariantId}, ${itemGrade}, 'myslabs', ${item.price}, ${item.id.toString()}, ${t500(item.title)}, ${item.grade ? `Grade ${item.grade}` : "Slabbed"}, ${t500(item.slab_link || `https://myslabs.com/slab/view/${item.id}`)}, ${t500(item.slab_image_1)}, ${contentHash}, NOW(), NOW())
          ON CONFLICT (content_hash) DO UPDATE SET price = EXCLUDED.price, last_seen_at = NOW()
        `);
      }
    }

    const mappedSold = soldData.items.map((item) => ({
      itemId: item.id.toString(),
      title: item.title,
      soldPrice: { value: item.price.toString(), currency: "USD" },
      condition: item.grade ? `Grade ${item.grade}` : "Slabbed",
      endDate: item.sold_date || new Date().toISOString(),
      shippingCost: (item.shipping_cost || 0).toString(),
      itemWebUrl: item.slab_link || `https://myslabs.com/slab/view/${item.id}`,
      image: { imageUrl: item.slab_image_1 },
      grade_key: item.grade ? String(item.grade) : "RAW"
    }));

    const mappedActive = activeData.items.map((item) => ({
      itemId: item.id.toString(),
      title: item.title,
      price: { value: item.price.toString(), currency: "USD" },
      condition: item.grade ? `Grade ${item.grade}` : "Slabbed",
      itemWebUrl: item.slab_link || `https://myslabs.com/slab/view/${item.id}`,
      image: { imageUrl: item.slab_image_1 },
      grade_key: item.grade ? String(item.grade) : "RAW"
    }));

    const snapshot = {
      platform: "myslabs",
      avgSoldPrice: avg.toFixed(2),
      lastSoldPrice: last.toFixed(2),
      lowestActive: lowest.toFixed(2),
      salesCount30d: prices.length,
      priceTrend30d: null,
    };

    return {
      query,
      fromCache: false,
      snapshots: [snapshot],
      activeListings: mappedActive,
      last7Days: {
        items: mappedSold.slice(0, Math.min(maxResults, 10)),
        totalEntries: mappedSold.length,
        period: "7d",
      },
      last30Days: {
        items: mappedSold.slice(0, maxResults),
        totalEntries: mappedSold.length,
        period: "30d",
      },
    };
  }
}

