import { vertexAiClient } from "../../lib/vertex-ai.client.js";
import { db } from "../../db/index.js";
import { sql } from "drizzle-orm";
import { ListingRepository } from "../listing/listing.repository.js";
import { EbayService } from "../listing/ebay.service.js";
import { SoldCompsService } from "../listing/sold-comps.service.js";
import { MyslabsService } from "../listing/myslabs.service.js";
import { env } from "../../config/index.js";

type Intent = 'inventory_query' | 'sales_query' | 'comp_query' | 'pricing_advice' | 'general';

export class AssistantService {
  private listingRepo = new ListingRepository();
  private ebayService = new EbayService(env);
  private soldCompsService = new SoldCompsService(env);
  private myslabsService = new MyslabsService(env);

  async processQuery(userId: string, message: string, history: { role: string; parts: { text: string }[] }[]) {
    // 1. Detect Intent
    const intent = await this.detectIntent(message, history);

    // 2. Fetch Context
    const ctx = await this.buildContext(userId, intent, message);

    // 3. Inject and Generate
    const systemPrompt = `
You are RSL Assistant, a sports card market expert helping dealers on the RSLCards platform.
You have access to this dealer's live data.

INVENTORY: ${JSON.stringify(ctx.inventory || [])}
SALES (last 30 days): ${JSON.stringify(ctx.sales || [])}
RECENT COMPS: ${JSON.stringify(ctx.comps || [])}

Rules:
1. Answer in plain English. Be concise.
2. Be specific with numbers (prices, quantities).
3. If you recommend action, explain why based on the data provided.
4. If the user asks about a card not in their context, base your answer only on available info or state you don't have that specific data.
    `.trim();

    // Use gemini-3.1-flash-lite as requested
    const response = await vertexAiClient.generateChat(systemPrompt, history, message, "gemini-3.1-flash-lite");

    return response;
  }

  private async detectIntent(message: string, history: any[]): Promise<Intent> {
    const prompt = `Classify the user's intent into exactly one of these categories:
- inventory_query (asking what cards they have, checking stock)
- sales_query (asking about their sales history, earnings, revenue)
- comp_query (asking for market value, recent sales of a card they don't necessarily own)
- pricing_advice (asking if they should lower/raise price, asking for pricing strategies)
- general (anything else)

User message: "${message}"

Respond with ONLY the raw category name, no extra text.`;

    try {
      const response = await vertexAiClient.generateChat(
        "You are an intent classifier. Respond ONLY with the exact category name.",
        [],
        prompt,
        "gemini-3.1-flash-lite"
      );
      const clean = response.trim().toLowerCase();
      if (['inventory_query', 'sales_query', 'comp_query', 'pricing_advice', 'general'].includes(clean)) {
        return clean as Intent;
      }
      return 'general';
    } catch (e) {
      return 'general';
    }
  }

  private async buildContext(userId: string, intent: Intent, message: string) {
    const ctx: any = {};

    if (intent === 'inventory_query' || intent === 'pricing_advice') {
      // Fetch up to 50 active inventory items
      const inventoryQuery = await db.execute(sql`
        SELECT c.year, c.set_name, c.card_number, c.manufacturer, p.name as player_name, i.cost_basis, l.list_price
        FROM inventory i
        JOIN card_variants cv ON i.variant_id = cv.id
        JOIN cards c ON cv.card_id = c.id
        JOIN players p ON c.player_id = p.id
        LEFT JOIN listings l ON l.inventory_id = i.id
        WHERE i.user_id = ${userId} AND i.listing_status != 'sold'
        LIMIT 50
      `);
      ctx.inventory = inventoryQuery.rows;
    }

    if (intent === 'sales_query') {
      // Fetch sales from the last 30 days
      const salesQuery = await db.execute(sql`
        SELECT c.year, c.set_name, p.name as player_name, t.price, t.type, t.created_at
        FROM transactions t
        JOIN inventory i ON t.inventory_id = i.id
        JOIN card_variants cv ON i.variant_id = cv.id
        JOIN cards c ON cv.card_id = c.id
        JOIN players p ON c.player_id = p.id
        WHERE i.user_id = ${userId} 
          AND t.type = 'sell' 
          AND t.created_at >= NOW() - INTERVAL '30 days'
        ORDER BY t.created_at DESC
        LIMIT 50
      `);
      ctx.sales = salesQuery.rows;
    }

    if (intent === 'comp_query' || intent === 'pricing_advice') {
      // Extract a potential card query from the message using LLM
      const extractPrompt = `Extract the sports card name from the following message. Return ONLY the card name (Player, Year, Set, Variation). If none, return "NONE".\n\nMessage: "${message}"`;
      const extracted = await vertexAiClient.generateChat("You are an extraction bot.", [], extractPrompt, "gemini-3.1-flash-lite");
      const cardQuery = extracted.trim();

      if (cardQuery !== "NONE" && cardQuery.length > 3) {
        try {
          const comps = await this.soldCompsService.getSoldItems(cardQuery);
          // Only send top 5 comps to save context tokens
          ctx.comps = comps.items.slice(0, 5).map(i => ({ title: i.title, soldPrice: i.soldPrice, date: i.endedAt }));
        } catch (e) {
          ctx.comps = [];
        }
      }
    }

    return ctx;
  }
}
