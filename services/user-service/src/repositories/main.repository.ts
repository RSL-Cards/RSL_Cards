// Repository layer
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

export async function updateOnboarding(
  env: Env,
  userId: string,
  data: OnboardingPayload,
): Promise<void> {
  const db = getDb(env);
  await db.transaction(async (tx: any) => {
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

export async function getUsersMe(_body: any, _params: any, _query: any) {
  return { message: `Get current user profile (dealer or consumer)` };
}

export async function patchUsersMe(_body: any, _params: any, _query: any) {
  return { message: `Update profile (name, bio, photo, sports, channels)` };
}

export async function getUsersMePaymentMethods(env: any, userId: string) {
  const db = getDb(env);
  const methods = await db
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

export async function postUsersMePaymentMethods(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Add new payment method` };
}

export async function patchUsersMePaymentMethodsId(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Update payment method handle or set as default` };
}

export async function deleteUsersMePaymentMethodsId(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Remove payment method` };
}

export async function getUsersMeConnectedPlatforms(env: any, userId: string) {
  // TODO: Query connectedPlatforms table when implemented
  // For now return empty array - platforms are connected via OAuth flows
  void env;
  void userId;
  return [];
}

export async function postUsersMeConnectedPlatforms(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Connect selling platform via OAuth` };
}

export async function deleteUsersMeConnectedPlatformsPlatform(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Disconnect a selling platform` };
}

export async function getUsersMeNotificationPreferences(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Get notification preference settings` };
}

export async function patchUsersMeNotificationPreferences(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Update notification preferences` };
}

export async function getUsersDealersCustomurl(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Get public dealer profile page` };
}

export async function getUsersDealers(_body: any, _params: any, _query: any) {
  return { message: `List dealers (filter: near, sport, rating)` };
}

export async function getUsersMeCustomers(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Get dealer's customer list` };
}

export async function postUsersMeCustomers(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Add new customer contact` };
}

export async function patchUsersMeCustomersId(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Update customer (name, notes, star)` };
}

export async function deleteUsersMeCustomersId(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Delete customer contact` };
}

export async function postUsersMeExport(_body: any, _params: any, _query: any) {
  return { message: `Request data export (GDPR)` };
}

export async function deleteUsersMe(_body: any, _params: any, _query: any) {
  return { message: `Delete account (GDPR right to erasure)` };
}
