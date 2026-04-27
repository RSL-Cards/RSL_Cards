import { eq } from "drizzle-orm";
import {
  users,
  refreshTokens,
  dealerProfiles,
  consumerProfiles,
  userPreferences,
} from "@rsl/shared-db";
import { getDb } from "../config/db.js";
import type { Env } from "../config/env.js";

export type UserRow = {
  id: string;
  email: string;
  passwordHash: string | null;
  role: "dealer" | "consumer" | "admin";
  oauthProvider?: "google" | "apple" | null;
  oauthId?: string | null;
};

export class AuthRepository {
  constructor(private readonly env: Env) { }

  private get db() {
    return getDb(this.env);
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    role: "dealer" | "consumer";
  }): Promise<UserRow> {
    return await this.db.transaction(async (tx: any) => {
      // 1. Insert user
      const [user] = (await tx
        .insert(users)
        .values({
          email: data.email,
          passwordHash: data.passwordHash,
          role: data.role,
        })
        .returning()) as any;

      const displayName = data.email.split("@")[0] || "User";

      // 2. Insert Profile
      if (data.role === "dealer") {
        await tx.insert(dealerProfiles).values({
          userId: user.id,
          displayName: displayName,
        });
      } else {
        await tx.insert(consumerProfiles).values({
          userId: user.id,
          displayName: displayName,
        });
      }

      // 3. Insert Preferences
      await tx.insert(userPreferences).values({
        userId: user.id,
      });

      return user;
    });
  }

  async getUserByEmail(email: string): Promise<UserRow | null> {
    const [user] = (await this.db
      .select()
      .from(users as any)
      .where(eq((users as any).email, email))
      .limit(1)) as any;
    return user || null;
  }

  async getUserById(id: string): Promise<UserRow | null> {
    const [user] = (await this.db
      .select()
      .from(users as any)
      .where(eq((users as any).id, id))
      .limit(1)) as any;
    return user || null;
  }

  async updateRefreshToken(
    userId: string,
    tokenHash: string | null,
    expiresAt?: Date,
    ipAddress?: string | null,
    deviceInfo?: string | null,
  ) {
    // Simple "single session per user" model for right now:
    await this.db
      .delete(refreshTokens as any)
      .where(eq((refreshTokens as any).userId, userId));

    if (tokenHash) {
      const expires = expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days fallback
      await this.db.insert(refreshTokens as any).values({
        userId: userId,
        tokenHash: tokenHash,
        expiresAt: expires,
        ...(ipAddress && { ipAddress: ipAddress.slice(0, 50) }),
        ...(deviceInfo && { deviceInfo: deviceInfo.slice(0, 500) }),
      });
    }
  }

  async getDealerProfile(userId: string) {
    const [profile] = (await this.db
      .select()
      .from(dealerProfiles as any)
      .where(eq((dealerProfiles as any).userId, userId))
      .limit(1)) as any;
    return profile || null;
  }

  async getRefreshToken(tokenHash: string) {
    const [tokenRecord] = (await this.db
      .select()
      .from(refreshTokens as any)
      .where(eq((refreshTokens as any).tokenHash, tokenHash))
      .limit(1)) as any;
    return tokenRecord || null;
  }

  async updateUserResetToken(userId: string, otp: string, expiry: Date) {
    return await this.db
      .update(users as any)
      .set({
        passwordResetToken: otp,
        passwordResetExpiry: expiry,
      } as any)
      .where(eq((users as any).id, userId))
      .returning({ id: (users as any).id });
  }

  async getResetTokenInfo(userId: string) {
    const [userRecord] = (await this.db
      .select({
        passwordResetToken: (users as any).passwordResetToken,
        passwordResetExpiry: (users as any).passwordResetExpiry,
      })
      .from(users as any)
      .where(eq((users as any).id, userId))
      .limit(1)) as any;
    return userRecord;
  }

  async resetPassword(userId: string, passwordHash: string) {
    await this.db
      .update(users as any)
      .set({
        passwordHash: passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
        updatedAt: new Date(),
      } as any)
      .where(eq((users as any).id, userId));
  }

  // async postAuthOauthGoogle(_body: any, _params: any, _query: any) {
  //   return { message: `Google OAuth sign-in / sign-up. Returns tokens` };
  // }

  // async postAuthOauthApple(_body: any, _params: any, _query: any) {
  //   return { message: `Apple Sign-In. Returns tokens` };
  // }

  async postAuthVerifyEmail(_body: any, _params: any, _query: any) {
    return { message: `Verify email with token sent to inbox` };
  }

  async postAuth2FaSetup(_body: any, _params: any, _query: any) {
    return { message: `Generate TOTP QR code for 2FA setup` };
  }

  async postAuth2FaVerify(_body: any, _params: any, _query: any) {
    return { message: `Verify TOTP code, enable 2FA on account` };
  }

  async postAuth2FaDisable(_body: any, _params: any, _query: any) {
    return { message: `Disable 2FA on account` };
  }

  async postAuthDeviceToken(_body: any, _params: any, _query: any) {
    return { message: `Register FCM device token for push notifications` };
  }

  async deleteAuthDeviceToken(_body: any, _params: any, _query: any) {
    return { message: `Remove FCM token on logout` };
  }
  async createOAuthUser(data: {
    email: string,
    provider: "google" | "apple",
    providerId: string,
    role: "dealer" | "consumer"
  }) {

    return await this.db.transaction(async (tx: any) => {

      const [user] = await tx
        .insert(users)
        .values({
          email: data.email,
          passwordHash: null,
          oauthProvider: data.provider,
          oauthId: data.providerId,
          role: data.role
        })
        .returning();

      if (data.role === "dealer") {
        await tx.insert(dealerProfiles).values({
          userId: user.id,
          displayName: data.email.split("@")[0]
        });
      } else {
        await tx.insert(consumerProfiles).values({
          userId: user.id,
          displayName: data.email.split("@")[0]
        });
      }

      await tx.insert(userPreferences)
        .values({ userId: user.id });

      return user;
    });
  }
}
