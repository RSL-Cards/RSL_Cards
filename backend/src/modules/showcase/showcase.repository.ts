import { eq, or, and, desc, ne, isNull } from "drizzle-orm";
import { db } from "../../db/index.js";
import { dealerProfiles } from "../../db/schema/user.js";
import { inventory } from "../../db/schema/inventory.js";
import { cards, players } from "../../db/schema/carddb.js";

function isValidUUID(uuid: string) {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuid);
}

export class ShowcaseRepository {
  async getDealerProfile(handleOrId: string) {
    const filters = [eq(dealerProfiles.customUrl, handleOrId)];
    
    if (isValidUUID(handleOrId)) {
      filters.push(eq(dealerProfiles.userId, handleOrId));
      filters.push(eq(dealerProfiles.id, handleOrId));
    }

    const [profile] = await db
      .select({
        id: dealerProfiles.id,
        userId: dealerProfiles.userId,
        displayName: dealerProfiles.displayName,
        bio: dealerProfiles.bio,
        photoUrl: dealerProfiles.photoUrl,
        customUrl: dealerProfiles.customUrl,
        sports: dealerProfiles.sports,
      })
      .from(dealerProfiles)
      .where(
        and(
          or(eq(dealerProfiles.isPublic, true), isNull(dealerProfiles.isPublic)),
          or(...filters)
        )
      )
      .limit(1);

    return profile || null;
  }

  async getDealerInventory(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const results = await db
      .select({
        id: inventory.id,
        photos: inventory.photos,
        gradeCompany: inventory.gradeCompany,
        gradeValue: inventory.gradeValue,
        cardId: inventory.cardId,
        cardName: players.name, // Fallback cardName to playerName
        cardYear: cards.year,
        cardSetName: cards.setName,
        cardNumber: cards.cardNumber,
        playerName: players.name,
        sport: inventory.sport,
        variation: inventory.variation
      })
      .from(inventory)
      .leftJoin(cards, eq(inventory.cardId, cards.id))
      .leftJoin(players, eq(inventory.playerId, players.id))
      .where(
        and(
          eq(inventory.userId, userId),
          or(
            eq(inventory.listingStatus, "unlisted"),
            eq(inventory.listingStatus, "listed"),
            isNull(inventory.listingStatus)
          )
        )
      )
      .orderBy(desc(inventory.addedAt))
      .limit(limit)
      .offset(offset);

    return results;
  }
}
