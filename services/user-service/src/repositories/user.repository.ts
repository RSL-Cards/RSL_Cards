import { eq } from "drizzle-orm";
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

  async updateOnboarding(userId: string, data: OnboardingPayload): Promise<void> {
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

  async getUsersMe(_body: any, _params: any, _query: any) {
    return { message: `Get current user profile (dealer or consumer)` };
  }

  async patchUsersMe(_body: any, _params: any, _query: any) {
    return { message: `Update profile (name, bio, photo, sports, channels)` };
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

  async deleteUsersMeConnectedPlatformsPlatform(_body: any, _params: any, _query: any) {
    return { message: `Disconnect a selling platform` };
  }

  async getUsersMeNotificationPreferences(_body: any, _params: any, _query: any) {
    return { message: `Get notification preference settings` };
  }

  async patchUsersMeNotificationPreferences(_body: any, _params: any, _query: any) {
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
