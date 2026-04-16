import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getDb } from "../config/db.js";
import { identifyCard } from "../clients/ximilar.js";
import type { CardIdentification, ScanResponse } from "../types/card.js";

export class CardDbRepository {
  constructor(private readonly env: Env) {}

  private get db() {
    return getDb(this.env);
  }

  private generateImageHash(base64: string): string {
    const start = base64.slice(0, 50);
    const end = base64.slice(-50);
    const middle = base64.length.toString();
    return Buffer.from(start + middle + end)
      .toString("base64")
      .slice(0, 64);
  }

  private generateCardId(details: CardIdentification): string {
    const normalized = [
      details.playerName.toLowerCase().replace(/[^a-z0-9]/g, ""),
      details.year,
      details.setName.toLowerCase().replace(/[^a-z0-9]/g, ""),
      (details.variation || "base").toLowerCase().replace(/[^a-z0-9]/g, ""),
    ].join("_");
    return normalized.slice(0, 255);
  }

  async scanCard(
    body: { image?: string },
    logger: { info: (o: Record<string, unknown>) => void },
  ): Promise<ScanResponse> {
    const imageBase64 = body.image || "";
    if (!imageBase64 || imageBase64.length < 100) {
      throw new Error("Invalid image data");
    }

    const imageHash = this.generateImageHash(imageBase64);
    logger.info({ msg: "Processing card scan", imageHash: imageHash.slice(0, 20) });

    const cachedCard = await this.db.execute(sql`
      SELECT c.* FROM cards c
      JOIN image_hashes ih ON ih.card_id = c.id
      WHERE ih.image_hash = ${imageHash}
      LIMIT 1
    `);

    if (cachedCard.rows.length > 0) {
      const row = cachedCard.rows[0];
      logger.info({ msg: "Card found in cache", cardId: row.id });

      return {
        card: {
          id: row.id as string,
          playerName: row.player_name as string,
          year: row.year as number,
          setName: row.set_name as string,
          variation: row.variation as string | undefined,
          cardNumber: row.card_number as string | undefined,
          sport: row.sport as string,
          manufacturer: row.manufacturer as string | undefined,
          isRookie: (row.is_rookie as boolean) || false,
          isAutograph: (row.is_autograph as boolean) || false,
          isRelic: (row.is_relic as boolean) || false,
          stockImageUrl: row.stock_image_url as string | undefined,
          source: "cache",
          confidence: 1.0,
        },
        confidence: 1.0,
        fromCache: true,
      };
    }

    logger.info({ msg: "Calling AI model for card identification" });
    const identification = await identifyCard(this.env, imageBase64, logger);
    const cardId = this.generateCardId(identification);

    const existingCard = await this.db.execute(sql`
      SELECT * FROM cards WHERE id = ${cardId} LIMIT 1
    `);

    if (existingCard.rows.length > 0) {
      logger.info({ msg: "Card already in database", cardId });

      await this.db.execute(sql`
        INSERT INTO image_hashes (image_hash, card_id, confidence, created_at)
        VALUES (${imageHash}, ${cardId}, ${identification.confidence}, NOW())
        ON CONFLICT (image_hash) DO NOTHING
      `).catch(() => {});

      const card = existingCard.rows[0] as Record<string, any>;
      return {
        card: {
          id: card.id as string,
          playerName: card.player_name as string,
          year: (card.year as number) || 0,
          setName: (card.set_name as string) || "",
          variation: card.variation as string | undefined,
          cardNumber: card.card_number as string | undefined,
          sport: (card.sport as string) || "",
          manufacturer: card.manufacturer as string | undefined,
          isRookie: (card.is_rookie as boolean) || false,
          isAutograph: (card.is_autograph as boolean) || false,
          isRelic: (card.is_relic as boolean) || false,
          stockImageUrl: card.stock_image_url as string | undefined,
          source: "ximilar",
          confidence: identification.confidence,
        },
        confidence: identification.confidence,
        fromCache: false,
      };
    }

    logger.info({ msg: "Storing new card in database", cardId });

    await this.db.execute(sql`
      INSERT INTO cards (
        id, player_name, year, set_name, variation, card_number, sport, 
        manufacturer, is_rookie, is_autograph, is_relic, source, created_at, updated_at
      ) VALUES (
        ${cardId}, ${identification.playerName}, ${identification.year}, 
        ${identification.setName}, ${identification.variation || null}, 
        ${identification.cardNumber || null}, ${identification.sport}, 
        ${identification.manufacturer || null}, ${identification.isRookie || false}, 
        ${identification.isAutograph || false}, ${identification.isRelic || false}, 
        'ximilar', NOW(), NOW()
      )
    `);

    await this.db.execute(sql`
      INSERT INTO image_hashes (image_hash, card_id, confidence, created_at)
      VALUES (${imageHash}, ${cardId}, ${identification.confidence}, NOW())
    `).catch((err) => {
      logger.info({
        msg: "Failed to store image hash",
        error: (err as Error).message,
      });
    });

    return {
      card: {
        id: cardId,
        playerName: identification.playerName,
        year: identification.year,
        setName: identification.setName,
        variation: identification.variation,
        cardNumber: identification.cardNumber,
        sport: identification.sport,
        manufacturer: identification.manufacturer,
        isRookie: identification.isRookie || false,
        isAutograph: identification.isAutograph || false,
        isRelic: identification.isRelic || false,
        source: "ximilar",
        confidence: identification.confidence,
      },
      confidence: identification.confidence,
      fromCache: false,
    };
  }

  async scanBarcode(_body: any, _params: any, _query: any) {
    return { message: `Identify graded card from PSA/BGS/SGC cert barcode` };
  }

  async searchCards(_body: any, _params: any, _query: any) {
    return { message: `Text search: player, year, set, variation. Returns top matches` };
  }

  async getCard(_body: any, _params: any, _query: any) {
    return { message: `Get card details + current comp data` };
  }

  async getComps(_body: any, _params: any, _query: any) {
    return { message: `Last 5 eBay sold prices + 30-day average + trend` };
  }

  async getPriceHistory(_body: any, _params: any, _query: any) {
    return { message: `30/90/365 day price history for sparkline chart` };
  }

  async getOfflineDb(_body: any, _params: any, _query: any) {
    return { message: `Download compressed offline card DB (top 50K cards)` };
  }

  async getPriceAlerts(_body: any, _params: any, _query: any) {
    return { message: `Get user's price alerts` };
  }

  async postPriceAlert(_body: any, _params: any, _query: any) {
    return { message: `Create price alert for a card` };
  }

  async deletePriceAlert(_body: any, _params: any, _query: any) {
    return { message: `Delete price alert` };
  }

  async getWantList(_body: any, _params: any, _query: any) {
    return { message: `Get user's want list` };
  }

  async postWantList(_body: any, _params: any, _query: any) {
    return { message: `Add card to want list with max price` };
  }

  async deleteWantList(_body: any, _params: any, _query: any) {
    return { message: `Remove from want list` };
  }

  async getDealRating(_body: any, _params: any, _query: any) {
    return { message: `Get deal rating (good/fair/overpaying) for price vs comp` };
  }
}
