import { ListingRepository } from "./listing.repository.js";
import { EbayService } from "./ebay.service.js";
import { EbayListingService } from "./ebay.listing.service.js";
import { SoldCompsService } from "./sold-comps.service.js";
import { MyslabsService } from "./myslabs.service.js";
import { env } from "../../config/index.js";
import { db } from "../../db/index.js";
import { sql } from "drizzle-orm";

export class ListingService {
  private readonly ebayService = new EbayService(env);
  private readonly ebayListingService = new EbayListingService(env);
  private readonly soldCompsService = new SoldCompsService(env);
  private readonly myslabsService = new MyslabsService(env);

  constructor(private readonly repository: ListingRepository) {}

  async getListings(userId: string) { return this.repository.getListings(userId); }
  async postListings(userId: string, body: any) { return this.repository.postListings(userId, body); }
  async getListingsId(id: string) { return this.repository.getListingsId(id); }
  async patchListingsIdPrice(id: string, body: any) { return this.repository.patchListingsIdPrice(id, body); }
  async deleteListingsId(id: string) { return this.repository.deleteListingsId(id); }
  async postListingsIdRelist(id: string) { return this.repository.postListingsIdRelist(id); }
  async getPriceComparison(inventoryId: string) { return this.repository.getPriceComparison(inventoryId); }
  async getFeeCalculator(query: any) { return this.repository.getFeeCalculator(query); }
  async generateContent(body: any) { return this.repository.generateContent(body); }
  async getAnalytics(userId: string) { return this.repository.getAnalytics(userId); }

  async publishEbayListing(userId: string, body: any) {
    const { inventoryId, price, description, condition, format, platforms } = body;
    let cardName = "Card";
    try {
      // Fetch user token for eBay
      const tokenResult = await db.execute(sql`
        SELECT access_token FROM platform_connections
        WHERE user_id = ${userId} AND platform = 'ebay' AND is_active = true
        LIMIT 1
      `);
      
      if (tokenResult.rows.length === 0) {
        throw new Error("User eBay account is not connected or active.");
      }
      const accessToken = tokenResult.rows[0].access_token as string;

      // Fetch the specific inventory item
      const inventoryResult = await db.execute(sql`
        SELECT * FROM inventory
        WHERE id = ${inventoryId} AND user_id = ${userId}
        LIMIT 1
      `);

      if (inventoryResult.rows.length === 0) {
        throw new Error("Inventory item not found.");
      }
      const itemData = inventoryResult.rows[0];
      cardName = `${itemData.year || ""} ${itemData.player_name || ""} ${itemData.set_name || ""}`.trim();

      // Combine with passed data
      const fullItemData = { ...itemData, price, description, condition, format };

      // Publish to eBay
      const publishResult = await this.ebayListingService.publishListing(accessToken, fullItemData);

      if (publishResult.success) {
        // Update inventory table to reflect new listing
        await db.execute(sql`
          UPDATE inventory
          SET listing_status = 'listed', current_market_value = ${price}, listed_platforms = array_append(listed_platforms, 'ebay'), updated_at = NOW()
          WHERE id = ${inventoryId} AND user_id = ${userId}
        `);
        return publishResult;
      } else {
        throw new Error(publishResult.error || "Failed to publish listing to eBay.");
      }
    } catch (publishError: any) {
      // Send failed sync notification (respecting user push & email preferences)
      try {
        const prefResult = await db.execute(sql`
          SELECT dp.notification_preferences, u.email as user_email
          FROM dealer_profiles dp
          JOIN users u ON u.id = dp.user_id
          WHERE dp.user_id = ${userId}
          LIMIT 1
        `);
        
        let sendPush = true;
        let sendEmail = false;
        let userEmail = null;

        if (prefResult.rows.length > 0) {
          const rowData = prefResult.rows[0] as any;
          userEmail = rowData.user_email;
          const prefs = rowData.notification_preferences as any;
          if (prefs && prefs.failedSync) {
            sendPush = prefs.failedSync.push !== false;
            sendEmail = prefs.failedSync.email === true;
          }
        }

        const alertTitle = "Marketplace Sync Failed";
        const alertBody = `Failed to list "${cardName}" to eBay: ${publishError.message}`;

        if (sendPush) {
          const { NotificationRepository } = await import("../notification/notification.repository.js");
          const { NotificationService } = await import("../notification/notification.service.js");
          const notifRepository = new NotificationRepository();
          const notifService = new NotificationService(notifRepository);
          await notifService.sendNotification(
            userId,
            alertTitle,
            alertBody,
            "failed_sync",
            { inventoryId, error: publishError.message }
          );
        }

        if (sendEmail && userEmail) {
          const { emailService } = await import("../email/index.js");
          await emailService.sendNotificationAlert(userEmail, {
            alertTitle: alertTitle,
            alertBody: alertBody,
            actionUrl: `https://app.rslcards.com/inventory?id=${inventoryId}`,
            actionText: "Manage Inventory Listing",
          });
        }
      } catch (err: any) {
        console.error(`[LISTING] Failed to send sync failure notification: ${err.message}`);
      }

      // Re-throw the original error so that the frontend API client handles it correctly
      throw publishError;
    }
  }

  async ebaySearch(params: any) {
    return await this.ebayService.searchListings(params);
  }

  async ebaySold(params: any) {
    return await this.repository.ebaySold(params, this.ebayService, this.soldCompsService);
  }

  async myslabsSold(params: any) {
    return await this.repository.myslabsSold(params, this.myslabsService);
  }
}
