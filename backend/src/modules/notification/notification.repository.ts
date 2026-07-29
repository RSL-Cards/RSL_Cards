import { db } from "../../db/index.js";
import { userPushTokens, notifications } from "../../db/schema/index.js";
import { eq, and, desc, count } from "drizzle-orm";
import { logger } from "../../lib/logger.js";

export class NotificationRepository {
  async registerToken(userId: string, token: string, platform: string, timezone?: string) {
    if (timezone) {
      try {
        const { userPreferences } = await import("../../db/schema/index.js");
        await db
          .insert(userPreferences)
          .values({ userId, timezone, updatedAt: new Date() })
          .onConflictDoUpdate({
            target: userPreferences.userId,
            set: { timezone, updatedAt: new Date() }
          });
      } catch (e: any) {
        logger.warn(`Failed to update user timezone preference: ${e.message}`);
      }
    }

    // Check if the token already exists
    const existing = await db
      .select()
      .from(userPushTokens)
      .where(eq(userPushTokens.token, token))
      .limit(1);

    if (existing.length > 0) {
      const record = existing[0];
      if (record.userId === userId && record.platform === platform && record.isActive) {
        return { success: true, message: "Token already registered" };
      }
      
      // Update token ownership or status
      await db
        .update(userPushTokens)
        .set({
          userId,
          platform,
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(userPushTokens.token, token));
      return { success: true, message: "Token ownership updated" };
    }

    // Insert new token
    await db.insert(userPushTokens).values({
      userId,
      token,
      platform,
      isActive: true
    });

    return { success: true, message: "Token registered successfully" };
  }

  async sendNotification(userId: string, title: string, body: string, type: string, data?: any) {
    try {
      // 1. Insert into local DB
      const [inserted] = await db
        .insert(notifications)
        .values({
          userId,
          title,
          body,
          type: type as any,
          channel: "push",
          status: "pending"
        })
        .returning();

      // 2. Fetch active push tokens
      const tokens = await db
        .select()
        .from(userPushTokens)
        .where(and(eq(userPushTokens.userId, userId), eq(userPushTokens.isActive, true)));

      if (tokens.length === 0) {
        logger.info(`[NOTIF] No active push tokens for user ${userId}. Saved to DB only.`);
        return inserted;
      }

      // 3. Dispatch to Expo / FCM
      for (const t of tokens) {
        if (t.platform === "ios" || t.platform === "android" || t.token.startsWith("ExponentPushToken") || t.token.startsWith("ExpoPushToken")) {
          // Send via Expo Push API
          try {
            const response = await fetch("https://exp.host/--/api/v2/push/send", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
              },
              body: JSON.stringify({
                to: t.token,
                title,
                body,
                data: data || {},
                sound: "default"
              })
            });
            const result = await response.json() as any;
            if (result.errors) {
              logger.error(`[NOTIF] Expo push failed for token ${t.token}: ${JSON.stringify(result.errors)}`);
            } else {
              logger.info(`[NOTIF] Sent Expo push to ${t.token} successfully`);
            }
          } catch (err: any) {
            logger.error(`[NOTIF] Fetch error sending Expo push: ${err.message}`);
          }
        } else {
          // Web FCM / Browser Push placeholder
          logger.info(`[NOTIF] Sending Web push to token ${t.token} (FCM Web placeholder)`);
        }
      }

      // Update local status to sent
      await db
        .update(notifications)
        .set({ status: "sent", sentAt: new Date() })
        .where(eq(notifications.id, inserted.id));

      return inserted;
    } catch (err: any) {
      logger.error(`[NOTIF] Failed to send notification: ${err.message}`);
      throw err;
    }
  }

  async getNotifications(userId: string) {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async getUnreadCount(userId: string) {
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.status, "sent"))); // non-read status is "sent" or "pending"

    return { count: result[0]?.count || 0 };
  }

  async markAllAsRead(userId: string) {
    await db
      .update(notifications)
      .set({ status: "read", readAt: new Date() })
      .where(eq(notifications.userId, userId));
    return { success: true };
  }

  async markAsRead(userId: string, id: string) {
    await db
      .update(notifications)
      .set({ status: "read", readAt: new Date() })
      .where(and(eq(notifications.userId, userId), eq(notifications.id, id)));
    return { success: true };
  }

  async getShows() {
    return { message: `List upcoming card shows` };
  }

  async getShowDetail(id: string) {
    return { message: `Show details for ${id}` };
  }

  async attendShow(userId: string, id: string) {
    return { success: true };
  }

  async leaveShow(userId: string, id: string) {
    return { success: true };
  }

  async getShowDealers(id: string) {
    return { message: `Dealers attending show ${id}` };
  }

  async adminCreateShow(body: any) {
    return { success: true };
  }

  async adminUpdateShow(id: string, body: any) {
    return { success: true };
  }

  async adminDeleteShow(id: string) {
    return { success: true };
  }
}
