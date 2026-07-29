import { sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { createHash } from "node:crypto";
import type { EbayService } from "./ebay.service.js";
import type { SoldCompsService } from "./sold-comps.service.js";
import type { MyslabsService, MyslabsItem } from "./myslabs.service.js";
import { vertexAiClient } from "../../lib/vertex-ai.client.js";
import { normalizeCompsGradeKey } from "./comps-query.util.js";

const t500 = (s?: string | null) => s && s.length > 500 ? s.slice(0, 500) : (s || null);

export class ListingRepository {
  private async filterWithGemini(
    query: string, 
    items: any[], 
    idField: string, 
    titleField: string,
    filterObj?: { must_include?: string[], must_exclude?: string[] },
    gradeKey?: string
  ): Promise<any[]> {
    if (!items || items.length === 0) return [];
    
    try {
      const minimalItems = items.map(i => ({ id: String(i[idField]), title: i[titleField] }));
      console.log(`[FILTER] Query: "${query}" | Items sent to Gemini:`, JSON.stringify(minimalItems));

      let filterInstructions = "";
      if (filterObj) {
        console.log(`[FILTER] 🔪 Applying KILL ALGORITHM Rules:`, JSON.stringify(filterObj));
        filterInstructions = `
9. KILL ALGORITHM:
   - The title MUST INCLUDE all of these terms (case-insensitive): ${JSON.stringify(filterObj.must_include || [])}
   - The title MUST NOT INCLUDE any of these terms (case-insensitive): ${JSON.stringify(filterObj.must_exclude || [])}
   If the title fails either of these conditions, REJECT IT IMMEDIATELY.`;
      }

      const prompt = `We are looking for EXACT matches for this specific sports card: "${query}".
For each of the search results, determine if it is an exact match for this player, card, set, and variation.
If it is a match, classify the grade of the card into one of the following grade categories based on its title and condition:
- "RAW" (if the card is ungraded)
- "5", "6", "7", "8", "9", "9.5", "10" (representing the numeric grade score if it is graded).

Here are the search results: ${JSON.stringify(minimalItems)}.

CRITICAL FILTERING RULES:
1. The listing MUST be the exact same player, year, set, and subset.
2. The listing MUST be the exact same variation/parallel (e.g. if the query specifies a parallel like "Silver" or "Orange Foil", reject base cards. If the query is for "Base", reject any parallels/refractors).
3. The listing MUST match the exact print run if one is specified (e.g. "/25", "/99").
4. Grade Classification:
   - Check the listing title / name first. If a grade number is explicitly mentioned in the title (e.g., "PSA 10", "PSA 9", "SGC 10", "BGS 9.5", "Grade 10"), classify it as that numeric grade.
   - If the listing title does NOT explicitly mention a grade number (even if it has company names like "PSA", "SGC" or describes it as "slabbed" or "graded" without a number), you MUST classify it as "RAW" (ungraded). Do not guess or assume a grade.
   - Watch out for raw card clickbait like "PSA 10 Ready?", "PSA 10 Candidate", "PSA?", "Lky PSA 10" or "PSA 10 Look". These must be classified as "RAW"! Only classify as a numeric grade if the card is ACTUALLY graded and slabbed.
   - For half-grades, map it to the closest match (e.g., "9.5" or "8.5").
5. Reject any lots, sealed boxes, packs, or digital cards.
6. DO NOT filter strictly based on card number. Minor formatting differences are okay.
7. SELLER KEYWORDS: Sellers on eBay often stuff extra words in the title such as "RC", "Rookie", "HOF", "SSP", team names (like "49ers"), or other fluff. Do NOT reject a listing just because it has extra words or missing words. 
8. As long as the core attributes (Player, Year, Set, Parallel/Refractor) are present in the title, ACCEPT IT.
9. Be very lenient with punctuation, capitalization, and slight variations in subset or parallel names. If the meaning is clearly the same, accept it.${filterInstructions}

Return a JSON object in this exact format with NO markdown, NO extra text:
{
  "matches": [
    { "id": "listing_id_string", "grade": "RAW" },
    { "id": "listing_id_string", "grade": "10" }
  ]
}
ONLY return the JSON object. Do not include any explanations.`;

      const response = await vertexAiClient.generateChat(
        "You are a strict data classifier. Only return valid JSON objects matching the requested schema.",
        [],
        prompt,
        "gemini-3.1-flash-lite"
      );

      const jsonStr = response.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(jsonStr);
      const matches = parsed.matches || [];

      console.log(`[FILTER] Gemini classified matches:`, matches);

      const gradeMap = new Map<string, string>();
      for (const m of matches) {
        gradeMap.set(String(m.id), String(m.grade));
      }

      return items
        .filter(i => gradeMap.has(String(i[idField])))
        .map(i => ({
          ...i,
          grade_key: gradeMap.get(String(i[idField])) || "RAW"
        }));
    } catch (e) {
      console.error("[FILTER] Failed to filter items with Gemini", e);
      return items.map(i => ({ ...i, grade_key: "RAW" }));
    }
  }

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

    console.log(`\n======================================================`);
    console.log(`[COMPS] 📡 Fetching LIVE comps for eBay...`);
    console.log(`[COMPS]  👉 Passing to Active Listings (Real eBay API): "${query}"`);
    console.log(`[COMPS]  👉 Passing to Sold Comps API: "${queryForSold}"`);
    console.log(`======================================================\n`);
    const ebayActiveStartTime = Date.now();
    const soldCompsStartTime = Date.now();
    
    const [soldResult, activeResult] = await Promise.allSettled([
      soldCompsService.getSoldItems(queryForSold).finally(() => {
        const duration = Date.now() - soldCompsStartTime;
        console.log(`[PERF] ⏱️ Sold Comps API (Sold) took ${duration}ms`);
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

    console.log(`\n======================================================`);
    console.log(`[COMPS] 📥 RECEIVED DATA FROM EBAY APIs:`);
    console.log(`[COMPS]  📦 Sold Comps API Response count: ${soldData.items?.length || 0}`);
    if (soldData.items && soldData.items.length > 0) {
      console.log(`[COMPS]  🔍 Sample Sold item: ${JSON.stringify(soldData.items[0])}`);
    }
    console.log(`[COMPS]  📦 Active Listings API Response count: ${activeData.itemSummaries?.length || 0}`);
    if (activeData.itemSummaries && activeData.itemSummaries.length > 0) {
      console.log(`[COMPS]  🔍 Sample Active item: ${JSON.stringify(activeData.itemSummaries[0])}`);
    }
    console.log(`======================================================\n`);

    // -------------------------------------------------------------
    // EBAY GEMINI FILTERING
    // -------------------------------------------------------------
    const ebaySoldBefore = soldData.items?.length || 0;
    const ebayActiveBefore = activeData.itemSummaries?.length || 0;
    
    let firstOriginalSoldItem = null;
    if (soldData.items && soldData.items.length > 0) {
      firstOriginalSoldItem = Object.assign({}, soldData.items[0]);
    }

    let cleanedFilter = filter;
    if (filter && Array.isArray(filter.must_exclude)) {
      cleanedFilter = {
        ...filter,
        must_exclude: filter.must_exclude.filter((term: string) => {
          const cleanTerm = term.trim();
          // Filter out numeric grade numbers or decimals (e.g. 5, 8.5, 9, 9.5, 10) from the excludes
          const isNumericGrade = /^\d+(\.\d+)?$/.test(cleanTerm);
          return !isNumericGrade;
        })
      };
    }

    if (soldData.items && soldData.items.length > 0) {
      soldData.items = await this.filterWithGemini(query, soldData.items, "itemId", "title", cleanedFilter, gradeKey);
    }
    if (activeData.itemSummaries && activeData.itemSummaries.length > 0) {
      activeData.itemSummaries = await this.filterWithGemini(query, activeData.itemSummaries, "itemId", "title", cleanedFilter, gradeKey);
    }

    const ebaySoldAfter = soldData.items?.length || 0;
    const ebayActiveAfter = activeData.itemSummaries?.length || 0;

    console.log(`\n======================================================`);
    console.log(`[COMPS] ✨ EBAY GEMINI FILTER RESULTS:`);
    console.log(`[COMPS]  👉 Active Query String: "${query}"`);
    console.log(`[COMPS]  👉 Active Listings: BEFORE = ${ebayActiveBefore} | AFTER = ${ebayActiveAfter}`);
    if (activeData.itemSummaries && activeData.itemSummaries.length > 0) {
      console.log(`[COMPS]  🔍 Sample Active: ${JSON.stringify(activeData.itemSummaries[0])}`);
    }
    console.log(`[COMPS]  👉 Sold Query String: "${queryForSold}"`);
    console.log(`[COMPS]  👉 Sold Comps: BEFORE = ${ebaySoldBefore} | AFTER = ${ebaySoldAfter}`);
    if (soldData.items && soldData.items.length > 0) {
      console.log(`[COMPS]  🔍 Sample Sold (AFTER): ${JSON.stringify(soldData.items[0])}`);
    } else if (ebaySoldBefore > 0 && firstOriginalSoldItem) {
      console.log(`[COMPS]  ⚠️ ALL ITEMS FILTERED OUT. First item BEFORE filter was: ${JSON.stringify(firstOriginalSoldItem)}`);
    }
    console.log("======================================================\n");

    console.log(`[COMPS] ✅ Returning LIVE comps for: ${query}`);
    console.log(`  -> Sold (Sold Comps API): ${soldData.items.length} items`);
    console.log(`  -> Active (Real eBay API): ${activeData.itemSummaries?.length ?? 0} items`);

    if (activeResult.status === "rejected") {
      console.warn("Failed to fetch active listings from ebayService:", activeResult.reason?.message || activeResult.reason);
    }

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

    // Always cache if we hit the APIs to avoid re-fetching, even if results are 0
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

      for (const item of soldData.items) {
        const itemGrade = (item as any).grade_key || gradeKey;
        const contentHash = createHash("sha256")
          .update(`soldcomps:${effectiveVariantId}:${itemGrade}:${item.url || item.itemId}:${item.endedAt}`)
          .digest("hex")
          .slice(0, 64);

        await db.execute(sql`
          INSERT INTO platform_sold_listings
            (id, variant_id, grade_key, platform, sold_price, platform_item_id, sold_at, title, condition, content_hash, created_at)
          VALUES
            (gen_random_uuid(), ${effectiveVariantId}, ${itemGrade}, 'ebay', ${parseFloat(item.soldPrice)}, ${item.itemId}, ${item.endedAt}, ${t500(item.title)}, ${item.itemCondition || "Used"}, ${contentHash}, NOW())
          ON CONFLICT (content_hash) DO NOTHING
        `);
      }

      for (const item of activeData.itemSummaries ?? []) {
        const itemGrade = (item as any).grade_key || gradeKey;
        const contentHash = createHash("sha256")
          .update(`ebayactive:${effectiveVariantId}:${itemGrade}:${item.itemId}`)
          .digest("hex")
          .slice(0, 64);
        
        await db.execute(sql`
          INSERT INTO platform_active_listings
            (id, variant_id, grade_key, platform, price, platform_item_id, title, condition, item_web_url, image_url, content_hash, last_seen_at, created_at)
          VALUES
            (gen_random_uuid(), ${effectiveVariantId}, ${itemGrade}, 'ebay', ${parseFloat(item.price?.value ?? "0")}, ${item.itemId}, ${t500(item.title)}, ${item.condition}, ${t500(item.itemWebUrl)}, ${t500(item.image?.imageUrl)}, ${contentHash}, NOW(), NOW())
          ON CONFLICT (content_hash) DO UPDATE SET last_seen_at = NOW()
        `);
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
    
    console.log(`\n======================================================`);
    console.log(`[COMPS] 📥 RECEIVED DATA FROM MYSLABS APIs:`);
    console.log(`[COMPS]  📦 Sold API Response count: ${soldData.items?.length || 0}`);
    if (soldData.items && soldData.items.length > 0) {
      console.log(`[COMPS]  🔍 Sample Sold item: ${JSON.stringify(soldData.items[0])}`);
    }
    console.log(`[COMPS]  📦 Active API Response count: ${activeData.items?.length || 0}`);
    if (activeData.items && activeData.items.length > 0) {
      console.log(`[COMPS]  🔍 Sample Active item: ${JSON.stringify(activeData.items[0])}`);
    }
    console.log(`======================================================\n`);

    const myslabsDuration = Date.now() - myslabsStartTime;
    console.log(`[PERF] ⏱️ MySlabs API (Sold & Active) total time: ${myslabsDuration}ms`);

    // -------------------------------------------------------------
    // MYSLABS GEMINI FILTERING
    // -------------------------------------------------------------
    const myslabsSoldBefore = soldData.items?.length || 0;
    const myslabsActiveBefore = activeData.items?.length || 0;

    // USER REQUEST: "myslabs data doesnt need send to modal , show all"
    // Bypassing Gemini filter for MySlabs.
    // soldData.items = await this.filterWithGemini(query, soldData.items, "id", "title", filter);
    // activeData.items = await this.filterWithGemini(query, activeData.items, "id", "title", filter);

    const myslabsSoldAfter = soldData.items?.length || 0;
    const myslabsActiveAfter = activeData.items?.length || 0;

    console.log(`\n======================================================`);
    console.log(`[COMPS] ✨ MYSLABS GEMINI FILTER RESULTS:`);
    console.log(`[COMPS]  👉 Active Query String: "${query}"`);
    console.log(`[COMPS]  👉 Active Listings: BEFORE = ${myslabsActiveBefore} | AFTER = ${myslabsActiveAfter}`);
    if (activeData.items && activeData.items.length > 0) {
      console.log(`[COMPS]  🔍 Sample Active: ${JSON.stringify(activeData.items[0])}`);
    }
    console.log(`[COMPS]  👉 Sold Query String: "${queryForSold}"`);
    console.log(`[COMPS]  👉 Sold Comps: BEFORE = ${myslabsSoldBefore} | AFTER = ${myslabsSoldAfter}`);
    if (soldData.items && soldData.items.length > 0) {
      console.log(`[COMPS]  🔍 Sample Sold: ${JSON.stringify(soldData.items[0])}`);
    }
    console.log(`======================================================\n`);

    console.log(`[COMPS] ✅ Returning LIVE comps from MySlabs APIs for: ${query}`);
    console.log(`  -> Sold (MySlabs API): ${soldData.items.length} items`);
    console.log(`  -> Active (MySlabs API): ${activeData.items.length} items`);

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
          ON CONFLICT (content_hash) DO UPDATE SET last_seen_at = NOW()
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

