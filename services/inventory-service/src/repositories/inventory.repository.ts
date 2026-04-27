import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getDb } from "../config/db.js";

export class InventoryRepository {
  constructor(private readonly env: Env) {}

  private get db() {
    return getDb(this.env);
  }

  async getInventory(_body: any, _params: any, query: any, userId: string) {
    const {
      sport,
      grade,
      status,
      sort = "added_at",
      page = 1,
      limit = 20,
    } = query;

    const offset = (Number(page) - 1) * Number(limit);

    const result = await this.db.execute(sql`
      SELECT * FROM inventory 
      WHERE user_id = ${userId}
      ${sport ? sql`AND sport = ${sport}` : sql``}
      ${grade ? sql`AND grade_key = ${grade}` : sql``}
      ${status ? sql`AND listing_status = ${status}` : sql``}
      ORDER BY ${sql.raw(sort)} DESC
      LIMIT ${Number(limit)} OFFSET ${offset}
    `);

    const countResult = await this.db.execute(sql`
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

  async getInventorySummary(
    _body: any,
    _params: any,
    _query: any,
    userId: string,
  ) {
    const result = await this.db.execute(sql`
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

  async getInventoryAgingAlerts(
    _body: any,
    _params: any,
    _query: any,
    userId: string,
  ) {
    const result = await this.db.execute(sql`
      SELECT * FROM inventory 
      WHERE user_id = ${userId}
        AND added_at < NOW() - INTERVAL '60 days'
        AND listing_status = 'unlisted'
      ORDER BY added_at ASC
      LIMIT 10
    `);

    return { alerts: result.rows };
  }

  async getInventoryId(
    _body: any,
    params: { id: string },
    _query: any,
    userId: string,
  ) {
    const { id } = params;

    const result = await this.db.execute(sql`
      SELECT * FROM inventory 
      WHERE id = ${id} AND user_id = ${userId}
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      throw new Error("Inventory item not found");
    }

    return result.rows[0];
  }

  async postInventory(
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
      currentMarketValue?: number;
      quantity?: number;
      photos?: string[];
      notes?: string;
    },
    _params: any,
    _query: any,
    userId: string,
  ) {
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
      currentMarketValue,
      quantity = 1,
      photos,
      notes,
    } = body;

    // STEP 1: Check for duplicates
    const duplicateCheck = await this.db.execute(sql`
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
    const result = await this.db.execute(sql`
      INSERT INTO inventory (
        user_id, card_id, player_name, year, set_name, variation, card_number, sport,
        grade_company, grade_value, grade_key, cert_number, cost_basis, current_market_value,
        quantity, photos, notes, listing_status, added_at, updated_at
      ) VALUES (
        ${userId}, ${cardId || null}, ${playerName}, ${year || null}, ${setName || null}, 
        ${variation || null}, ${cardNumber || null}, ${sport || null},
        ${gradeCompany || null}, ${gradeValue || null}, ${gradeKey}, ${certNumber || null},
        ${costBasis}, ${currentMarketValue || null}, ${quantity}, ${photos || null}, ${notes || null}, 
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

  async patchInventoryId(_body: any, _params: any, _query: any) {
    return { message: `Update card details (notes, photos, grade, cost)` };
  }

  async deleteInventoryId(_body: any, _params: any, _query: any) {
    return { message: `Remove card from inventory` };
  }

  async postInventoryRevalue(_body: any, _params: any, _query: any) {
    return { message: `Trigger manual market value refresh for all cards` };
  }

  async postInventoryIdPhotos(_body: any, _params: any, _query: any) {
    return { message: `Upload card photo (returns S3 presigned URL)` };
  }

  async deleteInventoryIdPhotosPhotoindex(
    _body: any,
    _params: any,
    _query: any,
  ) {
    return { message: `Remove a card photo` };
  }

  async postInventoryBulkImport(_body: any, _params: any, _query: any) {
    return { message: `Upload CSV/Excel file for bulk import. Returns jobId` };
  }

  async getInventoryBulkImportJobid(_body: any, _params: any, _query: any) {
    return { message: `Poll bulk import job status and progress` };
  }

  async getInventoryExport(_body: any, _params: any, _query: any) {
    return { message: `Export inventory as CSV` };
  }

  async getInventoryPublicDealerid(_body: any, _params: any, _query: any) {
    return { message: `Get dealer's public inventory for consumer app` };
  }
}
