import { sql } from "drizzle-orm";
import { db } from "../../db/index.js";

export class InventoryRepository {
  async getInventory(query: any, userId: string) {
    const {
      sport,
      grade,
      status,
      sort = "added_at",
      page = 1,
      limit = 5,
    } = query;

    const offset = (Number(page) - 1) * Number(limit);

    const result = await db.execute(sql`
      SELECT i.*, COALESCE(p.name, 'Unknown Player') as player_name 
      FROM inventory i
      LEFT JOIN players p ON i.player_id = p.id
      WHERE i.user_id = ${userId}
      ${sport ? sql`AND i.sport = ${sport}` : sql``}
      ${grade ? sql`AND i.grade_key = ${grade}` : sql``}
      ${status === 'available' ? sql`AND i.listing_status IN ('unlisted', 'listed')` : status ? sql`AND i.listing_status = ${status}` : sql``}
      ORDER BY i.${sql.raw(sort)} DESC
      LIMIT ${Number(limit)} OFFSET ${offset}
    `);

    const countResult = await db.execute(sql`
      SELECT COUNT(*) as total FROM inventory 
      WHERE user_id = ${userId}
      ${sport ? sql`AND sport = ${sport}` : sql``}
      ${grade ? sql`AND grade_key = ${grade}` : sql``}
      ${status === 'available' ? sql`AND listing_status IN ('unlisted', 'listed')` : status ? sql`AND listing_status = ${status}` : sql``}
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
      SELECT i.*, COALESCE(p.name, 'Unknown Player') as player_name 
      FROM inventory i
      LEFT JOIN players p ON i.player_id = p.id
      WHERE i.id = ${id} AND i.user_id = ${userId}
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      throw new Error("Inventory item not found");
    }

    return result.rows[0];
  }

  async postInventory(body: any, userId: string) {
    const {
      cardId,
      variantId,
      playerId,
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
      ebaySalesCompleted,
      ebayActiveListings,
      myslabsSalesCompleted,
      myslabsActiveListings,
    } = body;

    // Sanitize empty strings to null for strict typed columns (UUID, integer, etc.)
    const cleanCardId = cardId && cardId !== "" ? cardId : null;
    const cleanVariantId = variantId && variantId !== "" ? variantId : null;
    const cleanPlayerId = playerId && playerId !== "" ? playerId : null;
    const cleanYear = year && year !== "" ? Number(year) : null;
    const cleanSetName = setName && setName !== "" ? setName : null;
    const cleanVariation = variation && variation !== "" ? variation : null;
    const cleanCardNumber = cardNumber && cardNumber !== "" ? cardNumber : null;
    const cleanSport = sport && sport !== "" ? sport : null;
    const cleanGradeCompany = gradeCompany && gradeCompany !== "" ? gradeCompany : null;
    const cleanGradeValue = gradeValue && gradeValue !== "" ? Number(gradeValue) : null;
    const cleanCertNumber = certNumber && certNumber !== "" ? certNumber : null;
    const cleanCostBasis = costBasis && costBasis !== "" ? Number(costBasis) : 0;
    const cleanCurrentMarketValue = currentMarketValue && currentMarketValue !== "" ? Number(currentMarketValue) : null;
    const cleanQuantity = quantity && quantity !== "" ? Number(quantity) : 1;
    // Convert JS string[] to PostgreSQL array literal e.g. {"url1","url2"}
    const cleanPhotos = Array.isArray(photos) && photos.length > 0
      ? `{${photos.map((u: string) => `"${u.replace(/"/g, '\\"')}"`).join(",")}}`
      : null;
    const cleanNotes = notes && notes !== "" ? notes : null;
    const cleanEbaySalesCompleted = ebaySalesCompleted && ebaySalesCompleted !== "" ? ebaySalesCompleted : null;
    const cleanEbayActiveListings = ebayActiveListings && ebayActiveListings !== "" ? ebayActiveListings : null;
    const cleanMyslabsSalesCompleted = myslabsSalesCompleted && myslabsSalesCompleted !== "" ? myslabsSalesCompleted : null;
    const cleanMyslabsActiveListings = myslabsActiveListings && myslabsActiveListings !== "" ? myslabsActiveListings : null;

    const duplicateCheck = await db.execute(sql`
      SELECT id, added_at 
      FROM inventory 
      WHERE user_id = ${userId}
        AND card_id = ${cleanCardId}
        AND grade_key = ${gradeKey}
        ${cleanCertNumber ? sql`AND cert_number = ${cleanCertNumber}` : sql``}
      LIMIT 1
    `);

    if (duplicateCheck.rows.length > 0) {
      const existing = duplicateCheck.rows[0];
      throw new Error(
        `You already have this card in your inventory (added ${existing.added_at})`,
      );
    }

    // Defensive Programming layer: Ensure target card exists in master cards catalog to prevent foreign key errors.
    let resolvedVariantId = cleanVariantId;
    let resolvedPlayerId = cleanPlayerId;

    if (cleanCardId) {
      const cardExists = await db.execute(sql`
        SELECT id, player_id FROM cards WHERE id = ${cleanCardId} LIMIT 1
      `);
      if (cardExists.rows.length === 0) {
        // Resolve or create a fallback player
        if (!resolvedPlayerId) {
          const playerRes = await db.execute(sql`
            SELECT id FROM players WHERE name = 'Unknown Player' LIMIT 1
          `);
          if (playerRes.rows.length > 0) {
            resolvedPlayerId = (playerRes.rows[0] as any).id;
          } else {
            const insertPlayer = await db.execute(sql`
              INSERT INTO players (id, name, sport, created_at, updated_at)
              VALUES (gen_random_uuid(), 'Unknown Player', ${cleanSport || "basketball"}, NOW(), NOW())
              RETURNING id
            `);
            resolvedPlayerId = (insertPlayer.rows[0] as any).id;
          }
        }

        // Insert fallback base card
        await db.execute(sql`
          INSERT INTO cards (id, player_id, year, set_name, card_number, manufacturer, is_rookie, source, created_at, updated_at)
          VALUES (${cleanCardId}, ${resolvedPlayerId}, ${cleanYear}, ${cleanSetName}, ${cleanCardNumber}, 'unknown', false, 'fallback', NOW(), NOW())
        `);

        // Ensure "Base" variant exists
        const variantExists = await db.execute(sql`
          SELECT id FROM card_variants WHERE card_id = ${cleanCardId} AND name = 'Base' LIMIT 1
        `);
        if (variantExists.rows.length === 0) {
          const insertVariant = await db.execute(sql`
            INSERT INTO card_variants (id, card_id, year, set_name, name, is_parallel, is_base, created_at, updated_at)
            VALUES (gen_random_uuid(), ${cleanCardId}, ${cleanYear}, ${cleanSetName}, 'Base', false, true, NOW(), NOW())
            RETURNING id
          `);
          if (!resolvedVariantId) {
            resolvedVariantId = (insertVariant.rows[0] as any).id;
          }
        }
      } else {
        const cardRow = cardExists.rows[0] as any;
        if (!resolvedPlayerId) {
          resolvedPlayerId = cardRow.player_id;
        }
      }

      // If resolvedVariantId is null, try to query base variant as fallback
      if (!resolvedVariantId) {
        const varExists = await db.execute(sql`
          SELECT id FROM card_variants WHERE card_id = ${cleanCardId} AND name = 'Base' LIMIT 1
        `);
        if (varExists.rows.length > 0) {
          resolvedVariantId = (varExists.rows[0] as any).id;
        } else {
          // Create base variant as absolute final safety net
          const insertVariant = await db.execute(sql`
            INSERT INTO card_variants (id, card_id, year, set_name, name, is_parallel, is_base, created_at, updated_at)
            VALUES (gen_random_uuid(), ${cleanCardId}, ${cleanYear}, ${cleanSetName}, 'Base', false, true, NOW(), NOW())
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

    return {
      success: true,
      message: "Card added to inventory",
      item: result.rows[0],
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

  async postInventoryBulkImport(userId: string, _body: any) {
    return { message: `Upload CSV/Excel file for bulk import for ${userId}. Returns jobId` };
  }

  async getInventoryBulkImportJobId(jobId: string) {
    return { message: `Poll bulk import job status and progress for ${jobId}` };
  }

  async getInventoryExport(userId: string, query?: any) {
    const { dateFrom, dateTo } = query ?? {};

    const result = await db.execute(sql`
      SELECT 
        i.id,
        COALESCE(p.name, 'Unknown Player') as player_name,
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

