import { sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { createHash } from "node:crypto";
import type { EbayService } from "./ebay.service.js";
import type { SoldCompsService } from "./sold-comps.service.js";
import type { MyslabsService, MyslabsItem } from "./myslabs.service.js";
import { vertexAiClient } from "../../lib/vertex-ai.client.js";

const t500 = (s?: string | null) => s && s.length > 500 ? s.slice(0, 500) : (s || null);

export class ListingRepository {
  private async filterWithGemini(query: string, items: any[], idField: string, titleField: string): Promise<any[]> {
    if (!items || items.length === 0) return [];
    
    try {
      const minimalItems = items.map(i => ({ id: String(i[idField]), title: i[titleField] }));
      
      const prompt = `We searched for the sports card: "${query}". We got these listings: ${JSON.stringify(minimalItems)}.
Filter out any items that are NOT the EXACT card requested (e.g. wrong year, wrong set, different player, different variation, etc).
Return a JSON array of the "id"s of the listings that are the exact card requested.
If none match, return []. ONLY return a valid JSON array, nothing else.`;

      const response = await vertexAiClient.generateChat(
        "You are a strict data filter. Only return valid JSON arrays of strings.",
        [],
        prompt,
        "gemini-3.1-flash-lite"
      );

      const jsonStr = response.replace(/```json/gi, "").replace(/```/g, "").trim();
      const validIds = JSON.parse(jsonStr);

      if (!Array.isArray(validIds)) {
        throw new Error("Gemini did not return an array");
      }

      return items.filter(i => validIds.includes(String(i[idField])));
    } catch (e) {
      console.error("Failed to filter items with Gemini", e);
      return []; // fallback to returning empty array to ensure ONLY model-verified data is stored
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
    const { q, limit, variant_id, grade_key } = params;
    const maxResults = limit ? Number(limit) : 20;
    const query = q.trim();
    const gradeKey = grade_key?.trim() || "RAW";

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
      const cached = await db.execute(sql`
        SELECT
          id, variant_id, grade_key, platform, avg_sold_price, last_sold_price, lowest_active, sales_count_30d, fetched_at
        FROM card_comp_snapshots
        WHERE variant_id = ${effectiveVariantId}
          AND grade_key = ${gradeKey}
          AND platform = 'ebay'
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
          ORDER BY sold_at DESC
          LIMIT 20
        `);

        const mappedSold = (soldCached.rows as any[]).map((item) => ({
          itemId: item.platform_item_id,
          title: item.title,
          soldPrice: { value: item.sold_price, currency: "USD" },
          condition: item.condition || "Used",
          endDate: item.sold_at instanceof Date ? item.sold_at.toISOString() : new Date(item.sold_at).toISOString(),
          shippingCost: "0.00",
          itemWebUrl: `https://www.ebay.com/itm/${item.platform_item_id}`,
        }));

        const activeCached = await db.execute(sql`
          SELECT
            platform_item_id, price, title, condition, item_web_url, image_url
          FROM platform_active_listings
          WHERE variant_id = ${effectiveVariantId}
            AND grade_key = ${gradeKey}
            AND platform = 'ebay'
            AND last_seen_at >= NOW() - INTERVAL '24 hours'
          ORDER BY price ASC
          LIMIT 20
        `);

        const mappedActive = (activeCached.rows as any[]).map((item) => ({
          itemId: item.platform_item_id,
          title: item.title,
          price: { value: item.price, currency: "USD" },
          condition: item.condition || "Used",
          itemWebUrl: item.item_web_url,
          image: { imageUrl: item.image_url },
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

    console.log(`[COMPS] 📡 Fetching LIVE comps...`);
    console.log(`  -> Real eBay API (Active Listings) for: ${query}`);
    console.log(`  -> Sold Comps API (Sold Listings) for: ${query}`);
    const ebayActiveStartTime = Date.now();
    const soldCompsStartTime = Date.now();
    
    const [soldResult, activeResult] = await Promise.allSettled([
      soldCompsService.getSoldItems(query).finally(() => {
        const duration = Date.now() - soldCompsStartTime;
        console.log(`[PERF] ⏱️ Sold Comps API (Sold) took ${duration}ms`);
      }),
      ebayService.searchListings({
        q: query,
        limit: Math.min(maxResults, 20),
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

    // Filter results using Gemini
    console.log(`[COMPS] 🧠 Filtering ebay results using Gemini...`);
    soldData.items = await this.filterWithGemini(query, soldData.items, "itemId", "title");
    if (activeData.itemSummaries) {
      activeData.itemSummaries = await this.filterWithGemini(query, activeData.itemSummaries, "itemId", "title");
    }

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
    const lowest = activePrices.length ? activePrices[0] : 0;

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
        const contentHash = createHash("sha256")
          .update(`soldcomps:${effectiveVariantId}:${gradeKey}:${item.url}:${item.endedAt}`)
          .digest("hex")
          .slice(0, 64);

        await db.execute(sql`
          INSERT INTO platform_sold_listings
            (id, variant_id, grade_key, platform, sold_price, platform_item_id, sold_at, title, condition, content_hash, created_at)
          VALUES
            (gen_random_uuid(), ${effectiveVariantId}, ${gradeKey}, 'ebay', ${parseFloat(item.soldPrice)}, ${item.itemId}, ${item.endedAt}, ${t500(item.title)}, ${item.itemCondition || "Used"}, ${contentHash}, NOW())
          ON CONFLICT (content_hash) DO NOTHING
        `);
      }

      for (const item of activeData.itemSummaries ?? []) {
        const contentHash = createHash("sha256")
          .update(`ebayactive:${effectiveVariantId}:${gradeKey}:${item.itemId}`)
          .digest("hex")
          .slice(0, 64);
        
        await db.execute(sql`
          INSERT INTO platform_active_listings
            (id, variant_id, grade_key, platform, price, platform_item_id, title, condition, item_web_url, image_url, content_hash, last_seen_at, created_at)
          VALUES
            (gen_random_uuid(), ${effectiveVariantId}, ${gradeKey}, 'ebay', ${parseFloat(item.price?.value ?? "0")}, ${item.itemId}, ${t500(item.title)}, ${item.condition}, ${t500(item.itemWebUrl)}, ${t500(item.image?.imageUrl)}, ${contentHash}, NOW(), NOW())
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
      activeListings: activeData.itemSummaries ?? [],
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
    const { q, limit, variant_id, grade_key } = params;
    const maxResults = limit ? Number(limit) : 20;
    const query = q.trim();
    const gradeKey = grade_key?.trim() || "RAW";

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
          LIMIT 20
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
          LIMIT 20
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

    console.log(`[COMPS] 📡 Fetching LIVE comps from MySlabs APIs for: ${query}`);
    const myslabsStartTime = Date.now();
    let soldData: { items: MyslabsItem[] } = { items: [] };
    let activeData: { items: MyslabsItem[] } = { items: [] };

    try {
      const fetchMySlabs = async (searchQuery: string) => {
        return Promise.all([
          myslabsService.searchSlabs({ q: searchQuery, status: "sold", limit: maxResults }),
          myslabsService.searchSlabs({ q: searchQuery, status: "for-sale", limit: maxResults })
        ]);
      };

      [soldData, activeData] = await fetchMySlabs(query);
      
      // Fallback 1: Remove special characters and abbreviations
      if (soldData.items.length === 0 && activeData.items.length === 0) {
        let cleanQuery = query.replace(/[^a-zA-Z0-9\s]/g, ' ')
                              .replace(/\b(Ref\.|Refractor|PSA|BGS|SGC)\b/gi, '')
                              .replace(/\s+/g, ' ').trim();
                              
        if (cleanQuery !== query && cleanQuery.length > 3) {
          console.log(`[COMPS] 📡 MySlabs strict search returned 0. Falling back to clean: ${cleanQuery}`);
          [soldData, activeData] = await fetchMySlabs(cleanQuery);
        }

        // Fallback 2: Just the first 4 words (Player Name + Year)
        if (soldData.items.length === 0 && activeData.items.length === 0) {
          const shortQuery = cleanQuery.split(' ').slice(0, 4).join(' ');
          if (shortQuery !== cleanQuery && shortQuery.length > 5) {
            console.log(`[COMPS] 📡 MySlabs clean search returned 0. Falling back to short: ${shortQuery}`);
            [soldData, activeData] = await fetchMySlabs(shortQuery);
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch MySlabs LIVE comps:", e);
    }
    
    const myslabsDuration = Date.now() - myslabsStartTime;
    console.log(`[PERF] ⏱️ MySlabs API (Sold & Active) total time: ${myslabsDuration}ms`);

    // Filter results using Gemini
    console.log(`[COMPS] 🧠 Filtering myslabs results using Gemini...`);
    soldData.items = await this.filterWithGemini(query, soldData.items, "id", "title");
    activeData.items = await this.filterWithGemini(query, activeData.items, "id", "title");

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
        const contentHash = createHash("sha256")
          .update(`myslabssold:${effectiveVariantId}:${gradeKey}:${item.id}:${endedAtStr}`)
          .digest("hex")
          .slice(0, 64);

        await db.execute(sql`
          INSERT INTO platform_sold_listings
            (id, variant_id, grade_key, platform, sold_price, platform_item_id, sold_at, title, condition, content_hash, created_at)
          VALUES
            (gen_random_uuid(), ${effectiveVariantId}, ${gradeKey}, 'myslabs', ${item.price}, ${item.id.toString()}, ${endedAtStr}, ${t500(item.title)}, ${item.grade ? `Grade ${item.grade}` : "Slabbed"}, ${contentHash}, NOW())
          ON CONFLICT (content_hash) DO NOTHING
        `);
      }

      for (const item of activeData.items ?? []) {
        const contentHash = createHash("sha256")
          .update(`myslabsactive:${effectiveVariantId}:${gradeKey}:${item.id}`)
          .digest("hex")
          .slice(0, 64);
        
        await db.execute(sql`
          INSERT INTO platform_active_listings
            (id, variant_id, grade_key, platform, price, platform_item_id, title, condition, item_web_url, image_url, content_hash, last_seen_at, created_at)
          VALUES
            (gen_random_uuid(), ${effectiveVariantId}, ${gradeKey}, 'myslabs', ${item.price}, ${item.id.toString()}, ${t500(item.title)}, ${item.grade ? `Grade ${item.grade}` : "Slabbed"}, ${t500(item.slab_link || `https://myslabs.com/slab/view/${item.id}`)}, ${t500(item.slab_image_1)}, ${contentHash}, NOW(), NOW())
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
      image: { imageUrl: item.slab_image_1 }
    }));

    const mappedActive = activeData.items.map((item) => ({
      itemId: item.id.toString(),
      title: item.title,
      price: { value: item.price.toString(), currency: "USD" },
      condition: item.grade ? `Grade ${item.grade}` : "Slabbed",
      itemWebUrl: item.slab_link || `https://myslabs.com/slab/view/${item.id}`,
      image: { imageUrl: item.slab_image_1 }
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

