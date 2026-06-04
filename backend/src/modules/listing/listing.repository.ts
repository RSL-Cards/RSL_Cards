import { sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { createHash } from "node:crypto";
import type { EbayService } from "./ebay.service.js";
import type { SoldCompsService } from "./sold-comps.service.js";

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

        const ageMs = Date.now() - new Date(rows[0].fetched_at).getTime();
        if (ageMs >= 15 * 60 * 1000) {
          console.log(`[COMPS] Cache stale (${Math.floor(ageMs / 60000)}m old). Triggering background refresh from LIVE APIs...`);
          (async () => {
            try {
              const soldData = await soldCompsService.getSoldItems(query);
              const prices = soldData.items
                .map((i) => parseFloat(i.soldPrice))
                .filter((p) => p > 0);

              const activeData = await ebayService.searchListings({
                q: query,
                limit: Math.min(maxResults, 20),
                sort: "pricePlusShippingLowest",
              });
              const activePrices = (activeData.itemSummaries ?? [])
                .map((i) => parseFloat(i.price?.value ?? "0"))
                .filter((p) => p > 0);

              if (!prices.length && !activePrices.length) return;

              const avg = prices.length
                ? prices.reduce((a, b) => a + b, 0) / prices.length
                : 0;
              const last = prices.length ? prices[0] : 0;
              const lowest = activePrices.length ? activePrices[0] : 0;

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
                  .update(`soldcomps:${item.url}:${item.endedAt}`)
                  .digest("hex")
                  .slice(0, 64);

                await db.execute(sql`
                  INSERT INTO platform_sold_listings
                    (id, variant_id, grade_key, platform, sold_price, platform_item_id, sold_at, title, condition, content_hash, created_at)
                  VALUES
                    (gen_random_uuid(), ${effectiveVariantId}, ${gradeKey}, 'ebay', ${parseFloat(item.soldPrice)}, ${item.itemId}, ${item.endedAt}, ${item.title}, ${item.itemCondition || "Used"}, ${contentHash}, NOW())
                  ON CONFLICT (content_hash) DO NOTHING
                `);
              }
            } catch (err) {
              console.error("Background price refresh failed:", err);
            }
          })();
        }

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

    console.log(`[COMPS] 📡 Fetching LIVE comps from eBay APIs for: ${query}`);
    const [soldResult, activeResult] = await Promise.allSettled([
      soldCompsService.getSoldItems(query),
      ebayService.searchListings({
        q: query,
        limit: Math.min(maxResults, 20),
        sort: "pricePlusShippingLowest",
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

    // Only save snapshot cache if we successfully retrieved sold comps data
    if (effectiveVariantId && soldResult.status === "fulfilled" && soldData.items.length > 0) {
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
          .update(`soldcomps:${item.url}:${item.endedAt}`)
          .digest("hex")
          .slice(0, 64);

        await db.execute(sql`
          INSERT INTO platform_sold_listings
            (id, variant_id, grade_key, platform, sold_price, platform_item_id, sold_at, title, condition, content_hash, created_at)
          VALUES
            (gen_random_uuid(), ${effectiveVariantId}, ${gradeKey}, 'ebay', ${parseFloat(item.soldPrice)}, ${item.itemId}, ${item.endedAt}, ${item.title}, ${item.itemCondition || "Used"}, ${contentHash}, NOW())
          ON CONFLICT (content_hash) DO NOTHING
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
