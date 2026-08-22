import { sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { AppError } from "../../errors/app-error.js";
import { bullMqAdapter } from "../../adapters/bullmq.adapter.js";
import { createHash, randomUUID } from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const t500 = (s?: string | null) => s ? s.slice(0, 500) : null;

function parseJsonArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") return [parsed];
      return [];
    } catch {
      return [];
    }
  }
  if (typeof val === "object") return [val];
  return [];
}

function extractCompPrice(item: any): number {
  if (!item || typeof item !== "object") return 0;
  if (typeof item.price === "number" && !isNaN(item.price)) return item.price;
  if (typeof item.soldPrice === "number" && !isNaN(item.soldPrice)) return item.soldPrice;
  if (typeof item.sold_price === "number" && !isNaN(item.sold_price)) return item.sold_price;
  if (typeof item.list_price === "number" && !isNaN(item.list_price)) return item.list_price;
  if (item.soldPrice?.value != null) {
    const p = parseFloat(String(item.soldPrice.value));
    if (!isNaN(p)) return p;
  }
  if (item.price?.value != null) {
    const p = parseFloat(String(item.price.value));
    if (!isNaN(p)) return p;
  }
  if (item.price != null && typeof item.price !== "object") {
    const p = parseFloat(String(item.price));
    if (!isNaN(p)) return p;
  }
  if (item.sold_price != null && typeof item.sold_price !== "object") {
    const p = parseFloat(String(item.sold_price));
    if (!isNaN(p)) return p;
  }
  return 0;
}

function calculateMedianPrice(prices: number[]): number {
  if (!prices.length) return 0;
  const sorted = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function filterCompsByGradeServer(items: any[], selectedGrade: string): any[] {
  if (!Array.isArray(items) || !items.length) return [];
  if (!selectedGrade || selectedGrade.toUpperCase() === "ALL") return items;
  const gradeUpper = selectedGrade.toUpperCase().trim();

  return items.filter(item => {
    if (!item || typeof item !== "object") return false;
    const title = String(item.title || "").toUpperCase();
    const condition = String(item.condition || "").toUpperCase();

    const isUngradedCondition = condition === "UNGRADED" || condition === "RAW";
    const isGradedCondition = condition === "GRADED" || condition === "SLABBED" || condition === "SLAB";

    const itemGrade = String(item.grade_key || item.gradeKey || "");
    if (itemGrade) {
      let parsedGrade = "RAW";
      if (itemGrade !== "RAW") {
        const numMatch = itemGrade.match(/_(\d+(?:\.\d+)?)$/);
        parsedGrade = numMatch ? numMatch[1] : (/^\d+(?:\.\d+)?$/.test(itemGrade) ? itemGrade : "RAW");
      }
      if (parsedGrade === gradeUpper) {
        if (gradeUpper !== "RAW" && isUngradedCondition) return false;
        return true;
      }
      return false;
    }

    if (gradeUpper === "RAW") {
      if (isGradedCondition) return false;
      return !/\b(PSA|BGS|SGC|CGC|CSG|BECKETT|GRADED|SLAB|SLABBED)\b/i.test(title);
    } else {
      if (isUngradedCondition) return false;
      if (/\b(READY|RAW|LOT|NOT\s+(?:PSA|BGS|SGC|CGC|CSG)|PSA\s*\?|\?\s*PSA)\b/i.test(title)) {
        return false;
      }

      const hasGradingCompany = /\b(PSA|BGS|SGC|CGC|CSG|BECKETT|GRADED|SLAB|SLABBED)\b/i.test(title);
      if (!hasGradingCompany) return false;

      if (gradeUpper === "9") {
        return /\b9\b/.test(title) && !/\b9\.5\b/.test(title);
      } else if (gradeUpper === "9.5") {
        return /\b9\.5\b/.test(title);
      } else if (gradeUpper === "10") {
        return /\b10\b/.test(title);
      } else {
        const escapedGrade = gradeUpper.replace(".", "\\.");
        const gradeRegex = new RegExp(`\\b${escapedGrade}\\b`);
        return gradeRegex.test(title);
      }
    }
  });
}

function calculateMaxActiveListingPrice(item: any, selectedGrade?: string): number {
  const ebayActive = parseJsonArray(item.ebay_active_listings);
  const myslabsActive = parseJsonArray(item.myslabs_active_listings);
  const allActive = [...ebayActive, ...myslabsActive];
  if (!allActive.length) return 0;

  const targetGrade = selectedGrade || item.grade_key || "RAW";
  const filteredActive = filterCompsByGradeServer(allActive, targetGrade);
  const activePrices = (filteredActive.length > 0 ? filteredActive : allActive)
    .map((a: any) => extractCompPrice(a))
    .filter((p) => p > 0);

  return activePrices.length > 0 ? Math.max(...activePrices) : 0;
}

export class InventoryRepository {
  async getInventory(query: any, userId: string) {
    const {
      sport,
      grade,
      status,
      search,
      q,
      sort = "added_at",
      page = 1,
      limit = 20,
    } = query || {};

    const searchTerm = search || q;
    const offset = (Number(page) - 1) * Number(limit);

    const result = await db.execute(sql`
      SELECT i.*, COALESCE(p.name, '') as player_name 
      FROM inventory i
      LEFT JOIN players p ON i.player_id = p.id
      WHERE i.user_id = ${userId}
      ${sport ? sql`AND i.sport = ${sport}` : sql``}
      ${grade ? sql`AND i.grade_key = ${grade}` : sql``}
      ${status === 'all' ? sql`` : status === 'available' ? sql`AND i.listing_status IN ('unlisted', 'listed')` : status ? sql`AND i.listing_status = ${status}` : sql`AND i.listing_status IN ('unlisted', 'listed')`}
      ${searchTerm ? sql`AND (p.name ILIKE ${'%' + searchTerm + '%'} OR i.set_name ILIKE ${'%' + searchTerm + '%'} OR i.card_number ILIKE ${'%' + searchTerm + '%'} OR i.variation ILIKE ${'%' + searchTerm + '%'} OR i.grade_key ILIKE ${'%' + searchTerm + '%'})` : sql``}
      ORDER BY i.${sql.raw(sort)} DESC
      LIMIT ${Number(limit)} OFFSET ${offset}
    `);

    const countResult = await db.execute(sql`
      SELECT COUNT(*) as total FROM inventory i
      LEFT JOIN players p ON i.player_id = p.id
      WHERE i.user_id = ${userId}
      ${sport ? sql`AND i.sport = ${sport}` : sql``}
      ${grade ? sql`AND i.grade_key = ${grade}` : sql``}
      ${status === 'all' ? sql`` : status === 'available' ? sql`AND i.listing_status IN ('unlisted', 'listed')` : status ? sql`AND i.listing_status = ${status}` : sql`AND i.listing_status IN ('unlisted', 'listed')`}
      ${searchTerm ? sql`AND (p.name ILIKE ${'%' + searchTerm + '%'} OR i.set_name ILIKE ${'%' + searchTerm + '%'} OR i.card_number ILIKE ${'%' + searchTerm + '%'} OR i.variation ILIKE ${'%' + searchTerm + '%'} OR i.grade_key ILIKE ${'%' + searchTerm + '%'})` : sql``}
    `);

    const items = (result.rows as any[]).map((row) => {
      const maxActive = calculateMaxActiveListingPrice(row);
      const computedMarketVal = maxActive > 0 ? maxActive : parseFloat(row.current_market_value || "0");
      return {
        ...row,
        current_market_value: computedMarketVal,
        grade_highest_active: maxActive,
      };
    });

    return {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(countResult.rows[0]?.total || 0),
      },
    };
  }

  async getInventorySummary(userId: string) {
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) as total_cards,
        COALESCE(SUM(cost_basis * quantity), 0) as total_cost_basis,
        COALESCE(SUM(current_market_value * quantity), 0) as total_market_value,
        COALESCE(SUM((COALESCE(current_market_value, 0) - cost_basis) * quantity), 0) as total_unrealized_gain
      FROM inventory 
      WHERE user_id = ${userId}
        AND listing_status IN ('unlisted', 'listed')
    `);

    return result.rows[0];
  }

  async getInventoryAgingAlerts(userId: string) {
    const result = await db.execute(sql`
      SELECT * FROM inventory 
      WHERE user_id = ${userId}
        AND added_at < NOW() - INTERVAL '60 days'
        AND listing_status = 'unlisted'
      ORDER BY added_at ASC
      LIMIT 10
    `);

    return { alerts: result.rows };
  }

  async getInventoryId(id: string, userId: string, targetGrade?: string) {
    const result = await db.execute(sql`
      SELECT i.*, COALESCE(p.name, '') as player_name 
      FROM inventory i
      LEFT JOIN players p ON i.player_id = p.id
      WHERE i.id = ${id} AND i.user_id = ${userId}
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      throw new Error("Inventory item not found");
    }

    const item: any = result.rows[0];

    if (item.variant_id) {
      const soldListings = await db.execute(sql`
        SELECT platform_item_id, title, condition, grade_key, sold_price, sold_at, platform 
        FROM platform_sold_listings 
        WHERE variant_id = ${item.variant_id}
        ORDER BY sold_at DESC
      `);

      const activeListings = await db.execute(sql`
        SELECT platform_item_id, title, condition, grade_key, price, item_web_url, image_url, platform 
        FROM platform_active_listings 
        WHERE variant_id = ${item.variant_id}
        ORDER BY price ASC
      `);

      const mappedEbaySold = soldListings.rows
        .filter(r => !r.platform || String(r.platform).toLowerCase() === 'ebay')
        .map(row => ({
          itemId: row.platform_item_id,
          title: row.title,
          condition: row.condition,
          grade_key: row.grade_key,
          soldPrice: { value: row.sold_price },
          endDate: row.sold_at,
          platform: 'eBay'
        }));

      const mappedMyslabsSold = soldListings.rows
        .filter(r => r.platform && String(r.platform).toLowerCase() === 'myslabs')
        .map(row => ({
          itemId: row.platform_item_id,
          title: row.title,
          condition: row.condition,
          grade_key: row.grade_key,
          soldPrice: { value: row.sold_price },
          endDate: row.sold_at,
          platform: 'MySlabs'
        }));

      const mappedEbayActive = activeListings.rows
        .filter(r => !r.platform || String(r.platform).toLowerCase() === 'ebay')
        .map(row => ({
          itemId: row.platform_item_id,
          title: row.title,
          condition: row.condition,
          grade_key: row.grade_key,
          price: { value: row.price },
          itemWebUrl: row.item_web_url,
          image: { imageUrl: row.image_url },
          platform: 'eBay'
        }));

      const mappedMyslabsActive = activeListings.rows
        .filter(r => r.platform && String(r.platform).toLowerCase() === 'myslabs')
        .map(row => ({
          itemId: row.platform_item_id,
          title: row.title,
          condition: row.condition,
          grade_key: row.grade_key,
          price: { value: row.price },
          itemWebUrl: row.item_web_url,
          image: { imageUrl: row.image_url },
          platform: 'MySlabs'
        }));

      if (mappedEbaySold.length > 0) {
        item.ebay_sales_completed = JSON.stringify(mappedEbaySold);
      }
      if (mappedMyslabsSold.length > 0) {
        item.myslabs_sales_completed = JSON.stringify(mappedMyslabsSold);
      }
      if (mappedEbayActive.length > 0) {
        item.ebay_active_listings = JSON.stringify(mappedEbayActive);
      }
      if (mappedMyslabsActive.length > 0) {
        item.myslabs_active_listings = JSON.stringify(mappedMyslabsActive);
      }
    }

    // Live Comps Fallback: If comps are empty in DB, fetch live comps and persist to inventory item
    const isEbaySoldEmpty = !item.ebay_sales_completed || item.ebay_sales_completed === '[]' || item.ebay_sales_completed === 'null';
    const isEbayActiveEmpty = !item.ebay_active_listings || item.ebay_active_listings === '[]' || item.ebay_active_listings === 'null';

    if ((isEbaySoldEmpty || isEbayActiveEmpty) && item.player_name) {
      try {
        const { ListingRepository } = await import("../listing/listing.repository.js");
        const { EbayService } = await import("../listing/ebay.service.js");
        const { SoldCompsService } = await import("../listing/sold-comps.service.js");
        const { env } = await import("../../config/index.js");

        const listingRepo = new ListingRepository();
        const ebayService = new EbayService(env);
        const soldCompsService = new SoldCompsService(env);

        const cardQuery = [
          item.player_name,
          item.year,
          item.set_name,
          item.variation !== 'Base' ? item.variation : '',
          item.card_number ? `#${item.card_number}` : ''
        ].filter(Boolean).join(' ');

        if (cardQuery.trim()) {
          const compsResult = await listingRepo.ebaySold({
            q: cardQuery,
            grade_key: item.grade_key || 'RAW',
            variant_id: item.variant_id,
            limit: 20
          }, ebayService, soldCompsService);

          if (compsResult) {
            if (isEbaySoldEmpty && compsResult.last30Days?.items?.length > 0) {
              item.ebay_sales_completed = JSON.stringify(compsResult.last30Days.items);
            }
            if (isEbayActiveEmpty && compsResult.activeListings?.length > 0) {
              item.ebay_active_listings = JSON.stringify(compsResult.activeListings);
            }

            await db.execute(sql`
              UPDATE inventory 
              SET ebay_sales_completed = ${item.ebay_sales_completed},
                  ebay_active_listings = ${item.ebay_active_listings},
                  updated_at = NOW()
              WHERE id = ${id}
            `);
          }
        }
      } catch (liveFetchErr: any) {
        console.warn(`[INVENTORY] Failed live comps fallback for inventory item ${id}:`, liveFetchErr.message);
      }
    }
    
    // Calculate days_held on backend to guarantee sync with web-dashboard
    const addedAtTime = item.added_at ? new Date(item.added_at as string | number).getTime() : Date.now();
    item.days_held = Math.floor((Date.now() - addedAtTime) / (1000 * 60 * 60 * 24));

    // Server-Side Pre-Computed Grade Comps & Market Metrics
    const rawEbaySales = parseJsonArray(item.ebay_sales_completed);
    const rawMyslabsSales = parseJsonArray(item.myslabs_sales_completed);
    const rawEbayActive = parseJsonArray(item.ebay_active_listings);
    const rawMyslabsActive = parseJsonArray(item.myslabs_active_listings);

    const allSales = [...rawEbaySales, ...rawMyslabsSales];
    const allActive = [...rawEbayActive, ...rawMyslabsActive];

    const localEbaySales = allSales
      .filter((i: any) => i && typeof i === "object" && (!i.platform || String(i.platform).toLowerCase() === "ebay"))
      .map((i: any) => ({ ...i, platform: "eBay" }));
    const localMyslabsSales = allSales
      .filter((i: any) => i && typeof i === "object" && i.platform && String(i.platform).toLowerCase() === "myslabs")
      .map((i: any) => ({ ...i, platform: "MySlabs" }));

    const localEbayActive = allActive
      .filter((i: any) => i && typeof i === "object" && (!i.platform || String(i.platform).toLowerCase() === "ebay"))
      .map((i: any) => ({ ...i, platform: "eBay" }));
    const localMyslabsActive = allActive
      .filter((i: any) => i && typeof i === "object" && i.platform && String(i.platform).toLowerCase() === "myslabs")
      .map((i: any) => ({ ...i, platform: "MySlabs" }));

    const selectedGrade = targetGrade || (item.grade_key === "RAW" ? "RAW" : (item.grade_key ? item.grade_key.match(/[\d\.]+/)?.[0] || "RAW" : "RAW"));

    const filteredEbaySold = filterCompsByGradeServer(localEbaySales, selectedGrade);
    const filteredMyslabsSold = filterCompsByGradeServer(localMyslabsSales, selectedGrade);
    const filteredEbayActive = filterCompsByGradeServer(localEbayActive, selectedGrade);
    const filteredMyslabsActive = filterCompsByGradeServer(localMyslabsActive, selectedGrade);

    const sortedEbaySales = filteredEbaySold
      .filter((s: any) => extractCompPrice(s) > 0)
      .sort((a: any, b: any) => new Date(b.endDate ?? b.sold_date ?? b.sold_at ?? 0).getTime() - new Date(a.endDate ?? a.sold_date ?? a.sold_at ?? 0).getTime());
    const sortedMyslabsSales = filteredMyslabsSold
      .filter((s: any) => extractCompPrice(s) > 0)
      .sort((a: any, b: any) => new Date(b.endDate ?? b.sold_date ?? b.sold_at ?? 0).getTime() - new Date(a.endDate ?? a.sold_date ?? a.sold_at ?? 0).getTime());

    const sortedEbayActive = filteredEbayActive.sort((a: any, b: any) => extractCompPrice(a) - extractCompPrice(b));
    const sortedMyslabsActive = filteredMyslabsActive.sort((a: any, b: any) => extractCompPrice(a) - extractCompPrice(b));

    const allFilteredSoldComps = [...sortedEbaySales, ...sortedMyslabsSales]
      .sort((a: any, b: any) => new Date(b.endDate ?? b.sold_date ?? b.sold_at ?? 0).getTime() - new Date(a.endDate ?? a.sold_date ?? a.sold_at ?? 0).getTime());
    const allFilteredActiveComps = [...sortedEbayActive, ...sortedMyslabsActive]
      .sort((a: any, b: any) => extractCompPrice(a) - extractCompPrice(b));

    const gradePrices = allFilteredSoldComps.map((s: any) => extractCompPrice(s)).filter((p) => p > 0);
    const medianCompPrice = gradePrices.length > 0 ? calculateMedianPrice(gradePrices) : 0;

    const activePrices = allFilteredActiveComps.map((a: any) => extractCompPrice(a)).filter((p) => p > 0);
    const gradeLowestActive = activePrices.length > 0 ? Math.min(...activePrices) : 0;
    const gradeHighestActive = activePrices.length > 0 ? Math.max(...activePrices) : 0;

    // Attach pre-calculated server metrics
    item.selected_grade = selectedGrade;
    item.median_comp_price = medianCompPrice;
    item.verified_sales_count = gradePrices.length;
    item.grade_lowest_active = gradeLowestActive;
    item.grade_highest_active = gradeHighestActive;
    item.filtered_ebay_sold = sortedEbaySales;
    item.filtered_myslabs_sold = sortedMyslabsSales;
    item.filtered_ebay_active = sortedEbayActive;
    item.filtered_myslabs_active = sortedMyslabsActive;
    item.all_filtered_sold_comps = allFilteredSoldComps;
    item.all_filtered_active_comps = allFilteredActiveComps;

    return item;
  }

  async postInventory(body: any, userId: string) {
    let {
      cardId,
      variantId,
      playerId,
      playerName,
      year,
      setName,
      variation,
      cardNumber,
      sport,
      gradeCompany,
      gradeValue,
      gradeKey = "RAW",
      certNumber,
      costBasis,
      currentMarketValue,
      quantity = 1,
      photos,
      notes,
      listedPlatforms,
      ebaySalesCompleted,
      ebayActiveListings,
      myslabsSalesCompleted,
      myslabsActiveListings,
    } = body;

    // Sanitize empty strings to null for strict typed columns (UUID, integer, etc.)
    let cleanCardId = cardId && cardId.trim() !== "" ? cardId : `rsl-${randomUUID()}`;
    const cleanVariantId = variantId && variantId !== "" ? variantId : null;
    const cleanPlayerId = playerId && playerId !== "" ? playerId : null;
    const cleanPlayerName = playerName && playerName !== "" ? playerName : null;
    if (!cleanPlayerName) {
      throw new Error("Could not accurately identify card details. Player name is required to add a card.");
    }

    const cleanYear = year && year !== "" ? Number(year) : null;
    const cleanSetName = setName && setName !== "" ? setName : null;
    const cleanVariation = variation && variation !== "" ? variation : null;
    const cleanCardNumber = cardNumber && cardNumber !== "" ? cardNumber : null;
    const cleanSport = sport && sport !== "" ? sport : null;
    let cleanGradeCompany = gradeCompany && gradeCompany !== "" ? String(gradeCompany).toUpperCase() : null;
    let cleanGradeValue = gradeValue !== null && gradeValue !== undefined && gradeValue !== "" ? String(gradeValue) : null;

    if (gradeKey && gradeKey !== "RAW") {
      if (gradeKey.includes('_')) {
        const parts = gradeKey.split('_');
        if (!cleanGradeCompany) cleanGradeCompany = parts[0];
        if (!cleanGradeValue) cleanGradeValue = parts.slice(1).join('.');
      } else if (gradeKey.includes(' ')) {
        const parts = gradeKey.split(' ');
        if (!cleanGradeCompany) cleanGradeCompany = parts[0];
        if (!cleanGradeValue) cleanGradeValue = parts.slice(1).join('.');
      } else if (/^\d+(?:\.\d+)?$/.test(gradeKey.trim())) {
        if (!cleanGradeCompany) cleanGradeCompany = 'PSA';
        if (!cleanGradeValue) cleanGradeValue = gradeKey.trim();
      }
    }

    if (cleanGradeValue && (!cleanGradeCompany || cleanGradeCompany === 'RAW')) {
      cleanGradeCompany = 'PSA';
    }

    if (cleanGradeCompany && cleanGradeValue && cleanGradeCompany !== 'RAW') {
      gradeKey = `${cleanGradeCompany}_${cleanGradeValue.replace('.', '')}`;
    } else if (!gradeKey) {
      gradeKey = 'RAW';
    }

    const cleanCertNumber = certNumber && certNumber !== "" ? certNumber : null;
    const cleanCostBasis = costBasis && costBasis !== "" ? Number(costBasis) : 0;
    const cleanQuantity = quantity && quantity !== "" ? Number(quantity) : 1;

    let finalPhotosList = Array.isArray(photos) ? photos : [];

    if (finalPhotosList.length === 0) {
      let sourceImageUrl = null;
      if (body.comps?.activeListings && Array.isArray(body.comps.activeListings) && body.comps.activeListings.length > 0) {
        const match = body.comps.activeListings.find((item: any) => item.image?.imageUrl || item.imageUrl);
        if (match) {
          sourceImageUrl = match.image?.imageUrl || match.imageUrl;
        }
      }
      if (!sourceImageUrl && body.uploadedImageUrl) {
        sourceImageUrl = body.uploadedImageUrl;
      }

      if (sourceImageUrl) {
        const { env } = await import("../../config/index.js");
        if (env.S3_BUCKET_NAME) {
          const bucketDomain = `${env.S3_BUCKET_NAME}.s3`;
          if (sourceImageUrl.includes(bucketDomain)) {
            finalPhotosList = [sourceImageUrl];
          } else {
            try {
              const fetchRes = await fetch(sourceImageUrl);
              if (fetchRes.ok) {
                const arrayBuf = await fetchRes.arrayBuffer();
                const buffer = Buffer.from(arrayBuf);
                const contentType = fetchRes.headers.get("content-type") || "image/jpeg";
                const ext = contentType.includes("png") ? "png" : "jpg";
                const key = `cardimages/${userId}/imported/${randomUUID()}.${ext}`;
                const client = new S3Client({
                  region: env.AWS_REGION || "us-east-1",
                  credentials: {
                    accessKeyId: env.AWS_ACCESS_KEY_ID || "",
                    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "",
                  },
                });
                await client.send(
                  new PutObjectCommand({
                    Bucket: env.S3_BUCKET_NAME,
                    Key: key,
                    Body: buffer,
                    ContentType: contentType,
                  })
                );
                const publicUrl = `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;
                finalPhotosList = [publicUrl];
              }
            } catch (err: any) {
              console.warn("Failed to download/upload dynamic card photo:", err.message);
            }
          }
        }
      }
    }

    const cleanPhotos = finalPhotosList.length > 0
      ? `{${finalPhotosList.map((u: string) => `"${u.replace(/"/g, '\\"')}"`).join(",")}}`
      : null;
    const cleanNotes = notes && notes !== "" ? notes : null;
    const cleanListedPlatforms = Array.isArray(listedPlatforms) && listedPlatforms.length > 0
      ? `{${listedPlatforms.map((platform: string) => `"${platform.replace(/"/g, '\\"')}"`).join(",")}}`
      : null;
    const cleanListingStatus = cleanListedPlatforms ? "listed" : "unlisted";
    let cleanEbaySalesCompleted = ebaySalesCompleted && ebaySalesCompleted !== "" ? ebaySalesCompleted : null;
    let cleanEbayActiveListings = ebayActiveListings && ebayActiveListings !== "" ? ebayActiveListings : null;
    let cleanMyslabsSalesCompleted = myslabsSalesCompleted && myslabsSalesCompleted !== "" ? myslabsSalesCompleted : null;
    let cleanMyslabsActiveListings = myslabsActiveListings && myslabsActiveListings !== "" ? myslabsActiveListings : null;

    if (!cleanEbaySalesCompleted && body.comps) {
      if (body.comps.last30Days?.items && Array.isArray(body.comps.last30Days.items) && body.comps.last30Days.items.length > 0) {
        cleanEbaySalesCompleted = JSON.stringify(body.comps.last30Days.items);
      } else if (body.comps.last7Days?.items && Array.isArray(body.comps.last7Days.items) && body.comps.last7Days.items.length > 0) {
        cleanEbaySalesCompleted = JSON.stringify(body.comps.last7Days.items);
      }
    }

    if (!cleanEbayActiveListings && body.comps?.activeListings && Array.isArray(body.comps.activeListings) && body.comps.activeListings.length > 0) {
      cleanEbayActiveListings = JSON.stringify(body.comps.activeListings);
    }

    // Preserve user target price as cleanCurrentMarketValue
    const cleanCurrentMarketValue = currentMarketValue && currentMarketValue !== "" ? Number(currentMarketValue) : null;



    // Defensive Programming layer: Ensure target card exists in master cards catalog to prevent foreign key errors.
    let resolvedVariantId = cleanVariantId;
    let resolvedPlayerId = cleanPlayerId;

    // Strict Card Validation Guard: Do not allow unidentifiable / "Unknown" cards into inventory
    const isPlayerNameUnknown = !cleanPlayerName || cleanPlayerName.trim() === "" || cleanPlayerName.toLowerCase() === "unknown";
    if (!resolvedPlayerId && isPlayerNameUnknown) {
      throw new AppError("Invalid card data: A valid player name is required to add a card to inventory.", 400, "BAD_REQUEST");
    }

    if (!resolvedPlayerId && cleanPlayerName && cleanPlayerName.trim() !== "" && cleanPlayerName.toLowerCase() !== "unknown") {
      const existingPlayer = await db.execute(sql`
        SELECT id FROM players
        WHERE LOWER(name) = LOWER(${cleanPlayerName})
          AND sport = ${cleanSport || "basketball"}
        LIMIT 1
      `);

      if (existingPlayer.rows.length > 0) {
        resolvedPlayerId = (existingPlayer.rows[0] as any).id;
      } else {
        const insertPlayer = await db.execute(sql`
          INSERT INTO players (id, name, sport, created_at, updated_at)
          VALUES (gen_random_uuid(), ${cleanPlayerName}, ${cleanSport || "basketball"}, NOW(), NOW())
          RETURNING id
        `);
        resolvedPlayerId = (insertPlayer.rows[0] as any).id;
      }
    }

    if (cleanCardId) {
      const cardExists = await db.execute(sql`
        SELECT id, player_id FROM cards WHERE id = ${cleanCardId} LIMIT 1
      `);
      if (cardExists.rows.length === 0) {
        // Check if card with same details already exists to avoid unique constraint violation uq_card_player_year_set_number
        const cardByDetails = await db.execute(sql`
          SELECT id, player_id FROM cards 
          WHERE player_id = ${resolvedPlayerId}
            AND year = ${cleanYear}
            AND set_name = ${cleanSetName}
            ${cleanCardNumber ? sql`AND card_number = ${cleanCardNumber}` : sql`AND card_number IS NULL`}
          LIMIT 1
        `);

        if (cardByDetails.rows.length > 0) {
          const existingCard = cardByDetails.rows[0] as any;
          cleanCardId = existingCard.id;
          resolvedPlayerId = existingCard.player_id;
        } else {
          // If no player, we can't create a real card since player is required.
          if (!resolvedPlayerId) {
            cleanCardId = null;
          } else {
            // Insert fallback base card
            await db.execute(sql`
              INSERT INTO cards (id, player_id, year, set_name, card_number, manufacturer, is_rookie, source, created_at, updated_at)
              VALUES (${cleanCardId}, ${resolvedPlayerId}, ${cleanYear}, ${cleanSetName}, ${cleanCardNumber}, null, false, 'fallback', NOW(), NOW())
            `);
          }
        }

        if (cleanCardId) {
          // Ensure "Base" variant exists
          const variantExists = await db.execute(sql`
            SELECT id FROM card_variants WHERE card_id = ${cleanCardId} AND name = 'Base' LIMIT 1
          `);
          if (variantExists.rows.length === 0) {
            const insertVariant = await db.execute(sql`
              INSERT INTO card_variants (id, card_id, rsl_card_id, rsl_card_unique_name, year, set_name, name, is_parallel, is_base, created_at, updated_at)
              VALUES (gen_random_uuid(), ${cleanCardId}, 'rsl-' || gen_random_uuid(), ${cleanCardId} || '_base', ${cleanYear}, ${cleanSetName}, 'Base', false, true, NOW(), NOW())
              RETURNING id
            `);
            if (!resolvedVariantId) {
              resolvedVariantId = (insertVariant.rows[0] as any).id;
            }
          }
        }
      } else {
        const cardRow = cardExists.rows[0] as any;
        if (!resolvedPlayerId) {
          resolvedPlayerId = cardRow.player_id;
        }
      }

      // If resolvedVariantId is null, try to query base variant as fallback
      if (!resolvedVariantId && cleanCardId) {
        const varExists = await db.execute(sql`
          SELECT id FROM card_variants WHERE card_id = ${cleanCardId} AND name = 'Base' LIMIT 1
        `);
        if (varExists.rows.length > 0) {
          resolvedVariantId = (varExists.rows[0] as any).id;
        } else {
          // Create base variant as absolute final safety net
          const insertVariant = await db.execute(sql`
            INSERT INTO card_variants (id, card_id, rsl_card_id, rsl_card_unique_name, year, set_name, name, is_parallel, is_base, created_at, updated_at)
            VALUES (gen_random_uuid(), ${cleanCardId}, 'rsl-' || gen_random_uuid(), ${cleanCardId} || '_base', ${cleanYear}, ${cleanSetName}, 'Base', false, true, NOW(), NOW())
            RETURNING id
          `);
          resolvedVariantId = (insertVariant.rows[0] as any).id;
        }
      }
    }

    const cleanSearchString = (body.search_string || body.searchString)?.trim() || [
      cleanPlayerName,
      cleanYear,
      cleanSetName,
      cleanVariation && cleanVariation !== 'Base' ? cleanVariation : '',
      cleanCardNumber ? `#${cleanCardNumber}` : ''
    ].filter(Boolean).join(' ');

    if (resolvedVariantId && cleanSearchString) {
      await db.execute(sql`
        UPDATE card_variants 
        SET search_string = ${cleanSearchString}, updated_at = NOW() 
        WHERE id = ${resolvedVariantId} AND (search_string IS NULL OR search_string = '')
      `);
    }

    const result = await db.execute(sql`
      INSERT INTO inventory (
        user_id, card_id, variant_id, player_id, year, set_name, variation, card_number, sport,
        grade_company, grade_value, grade_key, cert_number, cost_basis, current_market_value,
        quantity, photos, notes, ebay_sales_completed, ebay_active_listings, myslabs_sales_completed, myslabs_active_listings, search_string, listing_status, added_at, updated_at
      ) VALUES (
        ${userId}, ${cleanCardId}, ${resolvedVariantId}, ${resolvedPlayerId}, ${cleanYear}, ${cleanSetName}, 
        ${cleanVariation}, ${cleanCardNumber}, ${cleanSport},
        ${cleanGradeCompany}, ${cleanGradeValue}, ${gradeKey}, ${cleanCertNumber},
        ${cleanCostBasis}, ${cleanCurrentMarketValue}, ${cleanQuantity}, ${cleanPhotos}::text[], ${cleanNotes},
        ${cleanEbaySalesCompleted}, ${cleanEbayActiveListings}, ${cleanMyslabsSalesCompleted}, ${cleanMyslabsActiveListings}, ${cleanSearchString}, 'unlisted', NOW(), NOW()
      )
      RETURNING *
    `);

    const invItem = result.rows[0] as any;

    try {
      console.log(`[DEBUG postInventory] body.comps exists?`, !!body.comps);
      if (body.comps) {
        console.log(`[DEBUG postInventory] body.comps keys:`, Object.keys(body.comps));
        console.log(`[DEBUG postInventory] body.comps.snapshots length:`, body.comps.snapshots?.length);
        console.log(`[DEBUG postInventory] resolvedVariantId:`, resolvedVariantId);
      }
      if (body.comps && body.comps.snapshots && body.comps.snapshots.length > 0 && resolvedVariantId) {
        const snap = body.comps.snapshots[0];
        await db.execute(sql`
          INSERT INTO card_comp_snapshots
            (id, variant_id, grade_key, platform, avg_sold_price, last_sold_price, lowest_active, sales_count_30d, fetched_at)
          VALUES
            (gen_random_uuid(), ${resolvedVariantId}, ${gradeKey}, 'ebay', ${Number(snap.avgSoldPrice)}, ${Number(snap.lastSoldPrice)}, ${Number(snap.lowestActive)}, ${Number(snap.salesCount30d)}, NOW())
          ON CONFLICT (variant_id, grade_key, platform)
          DO UPDATE SET
            avg_sold_price = EXCLUDED.avg_sold_price,
            last_sold_price = EXCLUDED.last_sold_price,
            lowest_active = EXCLUDED.lowest_active,
            sales_count_30d = EXCLUDED.sales_count_30d,
            fetched_at = NOW()
        `);

        if (body.comps.last30Days?.items && Array.isArray(body.comps.last30Days.items)) {
          for (const item of body.comps.last30Days.items) {
            const endDate = item.endDate || item.endedAt;
            const contentHash = createHash("sha256")
              .update(`ebay:${resolvedVariantId}:${gradeKey}:${item.itemId}:${endDate}`)
              .digest("hex")
              .slice(0, 64);

            await db.execute(sql`
              INSERT INTO platform_sold_listings
                (id, variant_id, grade_key, platform, sold_price, platform_item_id, sold_at, title, condition, content_hash, created_at)
              VALUES
                (gen_random_uuid(), ${resolvedVariantId}, ${gradeKey}, 'ebay', ${Number(item.soldPrice?.value || item.soldPrice || 0)}, ${item.itemId}, ${endDate}, ${t500(item.title)}, ${item.condition || "Used"}, ${contentHash}, NOW())
              ON CONFLICT (content_hash) DO NOTHING
            `);
          }
        }

        if (body.comps.activeListings && Array.isArray(body.comps.activeListings)) {
          for (const item of body.comps.activeListings) {
            const contentHash = createHash("sha256")
              .update(`ebayactive:${resolvedVariantId}:${gradeKey}:${item.itemId}`)
              .digest("hex")
              .slice(0, 64);

            await db.execute(sql`
              INSERT INTO platform_active_listings
                (id, variant_id, grade_key, platform, price, platform_item_id, title, condition, item_web_url, image_url, content_hash, last_seen_at, created_at)
              VALUES
                (gen_random_uuid(), ${resolvedVariantId}, ${gradeKey}, 'ebay', ${Number(item.price?.value ?? "0")}, ${item.itemId}, ${t500(item.title)}, ${item.condition}, ${t500(item.itemWebUrl)}, ${t500(item.image?.imageUrl)}, ${contentHash}, NOW(), NOW())
              ON CONFLICT (content_hash) DO UPDATE SET last_seen_at = NOW()
            `);
          }
        }
      } else {
        await bullMqAdapter.getQueue().add("refresh_single_comp", {
          item: {
            variant_id: resolvedVariantId,
            grade_key: gradeKey,
            grade_company: cleanGradeCompany,
            grade_value: cleanGradeValue,
            player_name: cleanPlayerName,
            year: cleanYear,
            set_name: cleanSetName,
            variant_name: cleanVariation || "Base",
            card_number: cleanCardNumber,
          }
        });
      }
    } catch (e: any) {
      console.warn("Failed to process comps or enqueue refresh_single_comp job", e.message);
    }

    // try {
    //   await bullMqAdapter.getQueue().add("generate_ai_insights", { userId });
    // } catch (e: any) {
    //   console.warn("Failed to trigger instant AI insights for user", e.message);
    // }

    return {
      message: "Card added to inventory",
      item: invItem,
    };
  }

  async patchInventoryId(id: string, body: any, userId: string) {
    const fields: any = {};

    if (body.gradeCompany !== undefined || body.gradeValue !== undefined || body.gradeKey !== undefined) {
      let company = body.gradeCompany !== undefined ? (body.gradeCompany ? String(body.gradeCompany).toUpperCase() : null) : undefined;
      let val = body.gradeValue !== undefined ? (body.gradeValue ? String(body.gradeValue) : null) : undefined;
      let key = body.gradeKey;

      if (key && key !== "RAW") {
        if (key.includes('_')) {
          const parts = key.split('_');
          if (company === undefined) company = parts[0];
          if (val === undefined) val = parts.slice(1).join('.');
        } else if (key.includes(' ')) {
          const parts = key.split(' ');
          if (company === undefined) company = parts[0];
          if (val === undefined) val = parts.slice(1).join('.');
        } else if (/^\d+(?:\.\d+)?$/.test(String(key).trim())) {
          if (company === undefined) company = 'PSA';
          if (val === undefined) val = String(key).trim();
        }
      }

      if (val && (!company || company === 'RAW')) {
        company = 'PSA';
      }

      if (company && val && company !== 'RAW') {
        key = `${company}_${val.replace('.', '')}`;
      } else if (key === undefined && company === 'RAW') {
        key = 'RAW';
      }

      if (company !== undefined) fields.grade_company = company;
      if (val !== undefined) fields.grade_value = val;
      if (key !== undefined) fields.grade_key = key;
    }

    if (body.photos !== undefined) {
      const photoList = Array.isArray(body.photos) ? body.photos : (body.photos ? [body.photos] : []);
      fields.photos = photoList.length > 0 ? photoList : null;
    } else if (body.imageUrl !== undefined || body.image_url !== undefined) {
      const url = body.imageUrl || body.image_url;
      fields.photos = url ? [url] : null;
    }

    if (body.costBasis !== undefined) fields.cost_basis = Number(body.costBasis);
    if (body.currentMarketValue !== undefined) fields.current_market_value = Number(body.currentMarketValue);
    if (body.notes !== undefined) fields.notes = body.notes;
    if (body.certNumber !== undefined) fields.cert_number = body.certNumber;

    fields.updated_at = new Date();

    const setEntries = Object.entries(fields);
    if (setEntries.length === 0) {
      return { message: "No fields to update" };
    }

    const setSql = setEntries.map(([col, val]) => {
      if (col === 'photos') {
        const photosArr = val as string[] | null;
        const cleanArr = photosArr && photosArr.length > 0 ? `{${photosArr.map((u: string) => `"${u.replace(/"/g, '\\"')}"`).join(",")}}` : null;
        return sql.raw(`${col} = ${cleanArr ? `'${cleanArr}'::text[]` : 'NULL'}`);
      }
      if (typeof val === 'string') return sql.raw(`${col} = '${val.replace(/'/g, "''")}'`);
      if (val === null) return sql.raw(`${col} = NULL`);
      if (val instanceof Date) return sql.raw(`${col} = '${val.toISOString()}'`);
      return sql.raw(`${col} = ${val}`);
    });

    await db.execute(sql`
      UPDATE inventory
      SET ${sql.join(setSql, sql`, `)}
      WHERE id = ${id} AND user_id = ${userId}
    `);

    const updatedItem = await db.execute(sql`
      SELECT i.*, p.name as player_name 
      FROM inventory i
      LEFT JOIN players p ON i.player_id = p.id
      WHERE i.id = ${id} AND i.user_id = ${userId}
    `);

    return {
      message: "Card updated successfully",
      item: updatedItem.rows[0]
    };
  }

  async deleteInventoryId(id: string, userId: string) {
    await db.execute(sql`UPDATE transactions SET inventory_id = NULL WHERE inventory_id = ${id}`);
    await db.execute(sql`UPDATE trade_items SET inventory_id = NULL WHERE inventory_id = ${id}`);
    await db.execute(sql`DELETE FROM listings WHERE inventory_id = ${id}`);
    await db.execute(sql`
      DELETE FROM inventory WHERE id = ${id} AND user_id = ${userId}
    `);
    return { success: true };
  }

  async postInventoryRevalue(userId: string) {
    return { message: `Trigger manual market value refresh for all cards for ${userId}` };
  }

  async postInventoryBulkImport(userId: string, body: any) {
    const rows = Array.isArray(body?.rows) ? body.rows : [];
    const results = [];

    for (const row of rows) {
      try {
        const platform = row.platform && row.platform !== "Unlisted" ? row.platform : null;
        const result = await this.postInventory(
          {
            playerName: row.playerName,
            year: row.year,
            setName: row.setName,
            sport: row.sport,
            gradeKey: row.gradeKey,
            costBasis: row.costBasis,
            currentMarketValue: row.currentMarketValue,
            listedPlatforms: platform ? [platform] : [],
          },
          userId,
        );
        results.push({ success: true, item: result.item });
      } catch (error: any) {
        results.push({ success: false, message: error.message ?? "Import failed" });
      }
    }

    return {
      success: true,
      imported: results.filter((result) => result.success).length,
      failed: results.filter((result) => !result.success).length,
      results,
      message: `Imported ${results.filter((result) => result.success).length} of ${rows.length} rows`,
    };
  }

  async getInventoryBulkImportJobId(jobId: string) {
    return { message: `Poll bulk import job status and progress for ${jobId}` };
  }

  async getInventoryExport(userId: string, query?: any) {
    const { dateFrom, dateTo } = query ?? {};

    const result = await db.execute(sql`
      SELECT 
        i.id,
        COALESCE(p.name, '') as player_name,
        i.year,
        i.set_name,
        i.variation,
        i.card_number,
        i.sport,
        i.grade_company,
        i.grade_value,
        i.grade_key,
        i.cert_number,
        i.cost_basis,
        i.current_market_value,
        COALESCE(i.current_market_value, 0) - i.cost_basis as unrealized_gain,
        CASE WHEN i.cost_basis > 0 
          THEN ROUND(((COALESCE(i.current_market_value, 0) - i.cost_basis) / i.cost_basis * 100)::numeric, 1)
          ELSE 0 END as gain_pct,
        i.quantity,
        i.listing_status,
        i.is_consignment,
        i.consignment_owner,
        i.notes,
        i.added_at
      FROM inventory i
      LEFT JOIN players p ON i.player_id = p.id
      WHERE i.user_id = ${userId}
      ${dateFrom ? sql`AND i.added_at >= ${dateFrom}::timestamptz` : sql``}
      ${dateTo ? sql`AND i.added_at <= ${dateTo}::timestamptz` : sql``}
      ORDER BY i.added_at DESC
    `);

    return { rows: result.rows, total: result.rows.length };
  }

  async getInventoryPublicDealerId(dealerId: string) {
    return { message: `Get dealer's public inventory for ${dealerId}` };
  }

  async getExistingPhotos(inventoryId: string, userId: string): Promise<string[]> {
    const result = await db.execute(sql`
      SELECT photos FROM inventory WHERE id = ${inventoryId} AND user_id = ${userId} LIMIT 1
    `);
    if (result.rows.length === 0) return [];
    return (result.rows[0] as any).photos ?? [];
  }

  async confirmPhotoAdded(inventoryId: string, url: string, userId: string) {
    await db.execute(sql`
      UPDATE inventory
      SET photos = ARRAY[${url}]::text[],
          image_url = ${url},
          updated_at = NOW()
      WHERE id = ${inventoryId} AND user_id = ${userId}
    `);
    return { success: true, url };
  }

  async deletePhoto(inventoryId: string, photoIndex: number, userId: string) {
    const item = await db.execute(sql`
      SELECT photos FROM inventory WHERE id = ${inventoryId} AND user_id = ${userId} LIMIT 1
    `);
    if (item.rows.length === 0) {
      throw new Error("Inventory item not found");
    }

    const photos: string[] = (item.rows[0] as any).photos ?? [];
    const urlToDelete = photos[photoIndex];

    const updated = photos.filter((_, i) => i !== photoIndex);
    await db.execute(sql`
      UPDATE inventory
      SET photos = ${updated.length > 0 ? updated : null}::text[],
          updated_at = NOW()
      WHERE id = ${inventoryId} AND user_id = ${userId}
    `);

    return { success: true, urlToDelete };
  }
}

