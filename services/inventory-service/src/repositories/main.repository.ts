// Repository layer for inventory-service
import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getDb } from "../config/db.js";

export async function getInventory(
  body: any,
  _params: any,
  query: any,
  env: Env,
  userId: string,
) {
  const db = getDb(env);
  const {
    sport,
    grade,
    status,
    sort = "added_at",
    page = 1,
    limit = 20,
  } = query;

  const offset = (Number(page) - 1) * Number(limit);

  const result = await db.execute(sql`
    SELECT * FROM inventory 
    WHERE user_id = ${userId}
    ${sport ? sql`AND sport = ${sport}` : sql``}
    ${grade ? sql`AND grade_key = ${grade}` : sql``}
    ${status ? sql`AND listing_status = ${status}` : sql``}
    ORDER BY ${sql.raw(sort)} DESC
    LIMIT ${Number(limit)} OFFSET ${offset}
  `);

  const countResult = await db.execute(sql`
    SELECT COUNT(*) as total FROM inventory WHERE user_id = ${userId}
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

export async function getInventorySummary(
  _body: any,
  _params: any,
  _query: any,
  env: Env,
  userId: string,
) {
  const db = getDb(env);

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

export async function getInventoryAgingAlerts(
  _body: any,
  _params: any,
  _query: any,
  env: Env,
  userId: string,
) {
  const db = getDb(env);

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

export async function getInventoryId(
  _body: any,
  params: { id: string },
  _query: any,
  env: Env,
  userId: string,
) {
  const db = getDb(env);
  const { id } = params;

  const result = await db.execute(sql`
    SELECT * FROM inventory 
    WHERE id = ${id} AND user_id = ${userId}
    LIMIT 1
  `);

  if (result.rows.length === 0) {
    throw new Error("Inventory item not found");
  }

  return result.rows[0];
}

/**
 * Add card to inventory with duplicate check
 * Same user cannot add the same card (by card_id + grade_key) twice
 * Different users CAN add the same card
 */
export async function postInventory(
  body: {
    cardId?: string;
    playerName: string;
    year?: number;
    setName?: string;
    variation?: string;
    cardNumber?: string;
    sport?: string;
    gradeCompany?: string;
    gradeValue?: string;
    gradeKey?: string;
    certNumber?: string;
    costBasis: number;
    quantity?: number;
    photos?: string[];
    notes?: string;
  },
  _params: any,
  _query: any,
  env: Env,
  userId: string,
) {
  const db = getDb(env);
  const {
    cardId,
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
    quantity = 1,
    photos,
    notes,
  } = body;

  // STEP 1: Check for duplicates - same user + same card + same grade
  const duplicateCheck = await db.execute(sql`
    SELECT id, player_name, added_at 
    FROM inventory 
    WHERE user_id = ${userId}
      AND card_id = ${cardId || null}
      AND grade_key = ${gradeKey}
      ${certNumber ? sql`AND cert_number = ${certNumber}` : sql``}
    LIMIT 1
  `);

  if (duplicateCheck.rows.length > 0) {
    const existing = duplicateCheck.rows[0];
    throw new Error(
      `You already have this card in your inventory: ${existing.player_name} (added ${existing.added_at})`,
    );
  }

  // STEP 2: Insert new inventory item
  const result = await db.execute(sql`
    INSERT INTO inventory (
      user_id, card_id, player_name, year, set_name, variation, card_number, sport,
      grade_company, grade_value, grade_key, cert_number, cost_basis, quantity,
      photos, notes, listing_status, added_at, updated_at
    ) VALUES (
      ${userId}, ${cardId || null}, ${playerName}, ${year || null}, ${setName || null}, 
      ${variation || null}, ${cardNumber || null}, ${sport || null},
      ${gradeCompany || null}, ${gradeValue || null}, ${gradeKey}, ${certNumber || null},
      ${costBasis}, ${quantity}, ${photos || null}, ${notes || null}, 
      'unlisted', NOW(), NOW()
    )
    RETURNING *
  `);

  return {
    success: true,
    message: "Card added to inventory",
    item: result.rows[0],
  };
}

export async function patchInventoryId(_body: any, _params: any, _query: any) {
  return { message: `Update card details (notes, photos, grade, cost)` };
}

export async function deleteInventoryId(_body: any, _params: any, _query: any) {
  return { message: `Remove card from inventory` };
}

export async function postInventoryRevalue(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Trigger manual market value refresh for all cards` };
}

export async function postInventoryIdPhotos(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Upload card photo (returns S3 presigned URL)` };
}

export async function deleteInventoryIdPhotosPhotoindex(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Remove a card photo` };
}

export async function postInventoryBulkImport(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Upload CSV/Excel file for bulk import. Returns jobId` };
}

export async function getInventoryBulkImportJobid(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Poll bulk import job status and progress` };
}

export async function getInventoryExport(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Export inventory as CSV` };
}

export async function getInventoryPublicDealerid(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Get dealer's public inventory for consumer app` };
}
