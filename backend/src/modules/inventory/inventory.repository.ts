import { sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { bullMqAdapter } from "../../adapters/bullmq.adapter.js";
import { createHash, randomUUID } from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const t500 = (s?: string | null) => s ? s.slice(0, 500) : null;

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
      ${status === 'available' ? sql`AND i.listing_status IN ('unlisted', 'listed')` : status ? sql`AND i.listing_status = ${status}` : sql``}
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
      ${status === 'available' ? sql`AND i.listing_status IN ('unlisted', 'listed')` : status ? sql`AND i.listing_status = ${status}` : sql``}
      ${searchTerm ? sql`AND (p.name ILIKE ${'%' + searchTerm + '%'} OR i.set_name ILIKE ${'%' + searchTerm + '%'} OR i.card_number ILIKE ${'%' + searchTerm + '%'} OR i.variation ILIKE ${'%' + searchTerm + '%'} OR i.grade_key ILIKE ${'%' + searchTerm + '%'})` : sql``}
    `);

    return {
      items: result.rows,
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

  async getInventoryId(id: string, userId: string) {
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

    const item = result.rows[0];

    if (item.variant_id && item.grade_key) {
      const soldListings = await db.execute(sql`
        SELECT * FROM platform_sold_listings 
        WHERE variant_id = ${item.variant_id} AND grade_key = ${item.grade_key}
        ORDER BY sold_at DESC LIMIT 20
      `);

      const activeListings = await db.execute(sql`
        SELECT * FROM platform_active_listings 
        WHERE variant_id = ${item.variant_id} AND grade_key = ${item.grade_key}
        ORDER BY price ASC LIMIT 20
      `);

      const mappedSold = soldListings.rows.map(row => ({
        itemId: row.platform_item_id,
        title: row.title,
        condition: row.condition,
        soldPrice: { value: row.sold_price },
        endDate: row.sold_at,
        platform: row.platform
      }));

      const mappedActive = activeListings.rows.map(row => ({
        itemId: row.platform_item_id,
        title: row.title,
        condition: row.condition,
        price: { value: row.price },
        itemWebUrl: row.item_web_url,
        image: { imageUrl: row.image_url },
        platform: row.platform
      }));

      item.ebay_sales_completed = JSON.stringify(mappedSold);
      item.ebay_active_listings = JSON.stringify(mappedActive);
    }
    
    // Calculate days_held on backend to guarantee sync with web-dashboard
    const addedAtTime = item.added_at ? new Date(item.added_at as string | number).getTime() : Date.now();
    item.days_held = Math.floor((Date.now() - addedAtTime) / (1000 * 60 * 60 * 24));

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
    const cleanGradeCompany = gradeCompany && gradeCompany !== "" ? gradeCompany : null;
    const cleanGradeValue = gradeValue && gradeValue !== "" ? Number(gradeValue) : null;

    if (gradeKey === "RAW" && cleanGradeCompany && cleanGradeValue) {
      gradeKey = `${cleanGradeCompany} ${cleanGradeValue}`;
    }

    const cleanCertNumber = certNumber && certNumber !== "" ? certNumber : null;
    const cleanCostBasis = costBasis && costBasis !== "" ? Number(costBasis) : 0;
    const cleanCurrentMarketValue = currentMarketValue && currentMarketValue !== "" ? Number(currentMarketValue) : null;
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
    const cleanEbaySalesCompleted = ebaySalesCompleted && ebaySalesCompleted !== "" ? ebaySalesCompleted : null;
    const cleanEbayActiveListings = ebayActiveListings && ebayActiveListings !== "" ? ebayActiveListings : null;
    const cleanMyslabsSalesCompleted = myslabsSalesCompleted && myslabsSalesCompleted !== "" ? myslabsSalesCompleted : null;
    const cleanMyslabsActiveListings = myslabsActiveListings && myslabsActiveListings !== "" ? myslabsActiveListings : null;



    // Defensive Programming layer: Ensure target card exists in master cards catalog to prevent foreign key errors.
    let resolvedVariantId = cleanVariantId;
    let resolvedPlayerId = cleanPlayerId;

    if (!resolvedPlayerId && cleanPlayerName) {
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

    const result = await db.execute(sql`
      INSERT INTO inventory (
        user_id, card_id, variant_id, player_id, year, set_name, variation, card_number, sport,
        grade_company, grade_value, grade_key, cert_number, cost_basis, current_market_value,
        quantity, photos, notes, ebay_sales_completed, ebay_active_listings, myslabs_sales_completed, myslabs_active_listings, listing_status, added_at, updated_at
      ) VALUES (
        ${userId}, ${cleanCardId}, ${resolvedVariantId}, ${resolvedPlayerId}, ${cleanYear}, ${cleanSetName}, 
        ${cleanVariation}, ${cleanCardNumber}, ${cleanSport},
        ${cleanGradeCompany}, ${cleanGradeValue}, ${gradeKey}, ${cleanCertNumber},
        ${cleanCostBasis}, ${cleanCurrentMarketValue}, ${cleanQuantity}, ${cleanPhotos}::text[], ${cleanNotes},
        ${cleanEbaySalesCompleted}, ${cleanEbayActiveListings}, ${cleanMyslabsSalesCompleted}, ${cleanMyslabsActiveListings}, 'unlisted', NOW(), NOW()
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
            player_name: cleanPlayerName,
            year: cleanYear,
            set_name: cleanSetName,
            variant_name: cleanVariation || "Base"
          }
        });
      }
    } catch (e: any) {
      console.warn("Failed to process comps or enqueue refresh_single_comp job", e.message);
    }

    return {
      message: "Card added to inventory",
      item: invItem,
    };
  }

  async patchInventoryId(id: string, body: any, userId: string) {
    // Basic implementation, can be expanded to dynamic updates
    return { message: `Update card details for ${id}` };
  }

  async deleteInventoryId(id: string, userId: string) {
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

  async confirmPhotoAdded(inventoryId: string, url: string, userId: string) {
    await db.execute(sql`
      UPDATE inventory
      SET photos = array_append(COALESCE(photos, ARRAY[]::text[]), ${url}),
          updated_at = NOW()
      WHERE id = ${inventoryId} AND user_id = ${userId}
    `);
    return { success: true };
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

