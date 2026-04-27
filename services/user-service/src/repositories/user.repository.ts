import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { dealerProfiles, paymentMethods } from "@rsl/shared-db";
import { getDb } from "../config/db.js";
import type { Env } from "../config/env.js";

export interface OnboardingPayload {
  sports: string[];
  sellChannels: string[];
  paymentMethods: {
    type: "venmo" | "cashapp" | "zelle" | "paypal";
    handle: string;
  }[];
}

export class UserRepository {
  constructor(private readonly env: Env) {}

  private get db() {
    return getDb(this.env);
  }

  async updateOnboarding(
    userId: string,
    data: OnboardingPayload,
  ): Promise<void> {
    await this.db.transaction(async (tx: any) => {
      await tx
        .update(dealerProfiles as any)
        .set({
          sports: data.sports,
          sellChannels: data.sellChannels,
          updatedAt: new Date(),
        })
        .where(eq((dealerProfiles as any).userId, userId));

      if (data.paymentMethods.length > 0) {
        await tx
          .delete(paymentMethods as any)
          .where(eq((paymentMethods as any).userId, userId));
        await tx.insert(paymentMethods as any).values(
          data.paymentMethods.map((pm, i) => ({
            userId,
            type: pm.type,
            handle: pm.handle,
            isDefault: i === 0,
          })),
        );
      }
    });
  }

  async getUsersMe(userId: string) {
    const profileRows = await this.db.execute(sql`
      SELECT
        u.id, u.email, u.role,
        dp.display_name, dp.bio, dp.phone, dp.photo_url,
        dp.sports, dp.sell_channels, dp.subscription_plan,
        dp.custom_url, dp.is_public
      FROM users u
      LEFT JOIN dealer_profiles dp ON dp.user_id = u.id
      WHERE u.id = ${userId}
      LIMIT 1
    `);
    if (profileRows.rows.length === 0) throw new Error("User not found");
    const r = profileRows.rows[0] as any;

    const pmRows = await this.db
      .select()
      .from(paymentMethods as any)
      .where(eq((paymentMethods as any).userId, userId));

    return {
      id: r.id,
      email: r.email,
      role: r.role,
      displayName: r.display_name,
      bio: r.bio ?? "",
      phone: r.phone ?? "",
      photoUrl: r.photo_url ?? null,
      sports: r.sports ?? [],
      sellChannels: r.sell_channels ?? [],
      subscriptionPlan: r.subscription_plan ?? "free",
      customUrl: r.custom_url ?? null,
      isPublic: r.is_public ?? true,
      paymentMethods: pmRows.map((m: any) => ({
        id: m.id,
        type: m.type,
        handle: m.handle,
        isDefault: m.isDefault ?? m.is_default,
      })),
    };
  }

  async patchUsersMe(
    userId: string,
    body: {
      displayName?: string;
      bio?: string;
      phone?: string;
      photoUrl?: string;
      sports?: string[];
      sellChannels?: string[];
      paymentMethods?: { type: string; handle: string }[];
    },
  ) {
    await this.db.transaction(async (tx: any) => {
      const updates: Record<string, any> = { updatedAt: new Date() };
      if (body.displayName !== undefined)
        updates.displayName = body.displayName;
      if (body.bio !== undefined) updates.bio = body.bio;
      if (body.phone !== undefined) updates.phone = body.phone;
      if (body.photoUrl !== undefined) updates.photoUrl = body.photoUrl;
      if (body.sports !== undefined) updates.sports = body.sports;
      if (body.sellChannels !== undefined)
        updates.sellChannels = body.sellChannels;

      await tx
        .update(dealerProfiles as any)
        .set(updates)
        .where(eq((dealerProfiles as any).userId, userId));

      if (body.paymentMethods && body.paymentMethods.length > 0) {
        await tx
          .delete(paymentMethods as any)
          .where(eq((paymentMethods as any).userId, userId));
        await tx.insert(paymentMethods as any).values(
          body.paymentMethods.map((pm: any, i: number) => ({
            userId,
            type: pm.type,
            handle: pm.handle,
            isDefault: i === 0,
          })),
        );
      }
    });
    return { success: true };
  }

  async getUsersMePaymentMethods(userId: string) {
    const methods = await this.db
      .select()
      .from(paymentMethods as any)
      .where(eq((paymentMethods as any).userId, userId));
    return methods.map((m: any) => ({
      id: m.id,
      type: m.type,
      handle: m.handle,
      isDefault: m.isDefault,
    }));
  }

  async postUsersMePaymentMethods(_body: any, _params: any, _query: any) {
    return { message: `Add new payment method` };
  }

  async patchUsersMePaymentMethodsId(_body: any, _params: any, _query: any) {
    return { message: `Update payment method handle or set as default` };
  }

  async deleteUsersMePaymentMethodsId(_body: any, _params: any, _query: any) {
    return { message: `Remove payment method` };
  }

  async getUsersMeConnectedPlatforms(userId: string) {
    // TODO: Query connectedPlatforms table when implemented
    void userId;
    return [];
  }

  async postUsersMeConnectedPlatforms(_body: any, _params: any, _query: any) {
    return { message: `Connect selling platform via OAuth` };
  }

  async deleteUsersMeConnectedPlatformsPlatform(
    _body: any,
    _params: any,
    _query: any,
  ) {
    return { message: `Disconnect a selling platform` };
  }

  async getUsersMeNotificationPreferences(
    _body: any,
    _params: any,
    _query: any,
  ) {
    return { message: `Get notification preference settings` };
  }

  async patchUsersMeNotificationPreferences(
    _body: any,
    _params: any,
    _query: any,
  ) {
    return { message: `Update notification preferences` };
  }

  async getUsersDealersCustomurl(_body: any, _params: any, _query: any) {
    return { message: `Get public dealer profile page` };
  }

  async getUsersDealers(_body: any, _params: any, _query: any) {
    return { message: `List dealers (filter: near, sport, rating)` };
  }

  async getUsersMeCustomers(_body: any, _params: any, _query: any) {
    return { message: `Get dealer's customer list` };
  }

  async postUsersMeCustomers(_body: any, _params: any, _query: any) {
    return { message: `Add new customer contact` };
  }

  async patchUsersMeCustomersId(_body: any, _params: any, _query: any) {
    return { message: `Update customer (name, notes, star)` };
  }

  async deleteUsersMeCustomersId(_body: any, _params: any, _query: any) {
    return { message: `Delete customer contact` };
  }

  async postUsersMeExport(_body: any, _params: any, _query: any) {
    return { message: `Request data export (GDPR)` };
  }

  async deleteUsersMe(_body: any, _params: any, _query: any) {
    return { message: `Delete account (GDPR right to erasure)` };
  }
}
