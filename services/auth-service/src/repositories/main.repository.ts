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
};

export async function createUser(
  env: Env,
  data: { email: string; passwordHash: string; role: "dealer" | "consumer" },
): Promise<UserRow> {
  const db = getDb(env);

  return await db.transaction(async (tx: any) => {
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

export async function getUserByEmail(
  env: Env,
  email: string,
): Promise<UserRow | null> {
  const db = getDb(env);
  const [user] = (await db
    .select()
    .from(users as any)
    .where(eq((users as any).email, email))
    .limit(1)) as any;
  return user || null;
}

export async function getUserById(
  env: Env,
  id: string,
): Promise<UserRow | null> {
  const db = getDb(env);
  const [user] = (await db
    .select()
    .from(users as any)
    .where(eq((users as any).id, id))
    .limit(1)) as any;
  return user || null;
}

export async function updateRefreshToken(
  env: Env,
  userId: string,
  tokenHash: string | null,
  expiresAt?: Date,
  ipAddress?: string | null,
  deviceInfo?: string | null,
) {
  const db = getDb(env);
  // Simple "single session per user" model for right now:
  await db
    .delete(refreshTokens as any)
    .where(eq((refreshTokens as any).userId, userId));

  if (tokenHash) {
    const expires = expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days fallback
    await db.insert(refreshTokens as any).values({
      userId: userId,
      tokenHash: tokenHash,
      expiresAt: expires,
      ...(ipAddress && { ipAddress: ipAddress.slice(0, 50) }),
      ...(deviceInfo && { deviceInfo: deviceInfo.slice(0, 500) }),
    });
  }
}

export async function getDealerProfile(env: Env, userId: string) {
  const db = getDb(env);
  const [profile] = (await db
    .select()
    .from(dealerProfiles as any)
    .where(eq((dealerProfiles as any).userId, userId))
    .limit(1)) as any;
  return profile || null;
}

/// Removed: updateOnboarding moved to user-service

export async function getRefreshToken(env: Env, tokenHash: string) {
  const db = getDb(env);
  const [tokenRecord] = (await db
    .select()
    .from(refreshTokens as any)
    .where(eq((refreshTokens as any).tokenHash, tokenHash))
    .limit(1)) as any;
  return tokenRecord || null;
}

/// Stubs for extended auth paths

export async function postAuthOauthGoogle(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Google OAuth sign-in / sign-up. Returns tokens` };
}

export async function postAuthOauthApple(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Apple Sign-In. Returns tokens` };
}

export async function postAuthVerifyEmail(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Verify email with token sent to inbox` };
}

export async function postAuthForgotPassword(
  env: Env,
  body: { email: string },
) {
  const db = getDb(env);

  try {
    // Find user by email
    const user = await getUserByEmail(env, body.email);
    if (!user) {
      // Return success even if user not found (security best practice)
      return { message: "If an account exists, an OTP has been sent" };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiry to 15 minutes from now
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    // Debug logging
    console.log("[DEBUG] Updating user:", user.id);
    console.log("[DEBUG] Users table:", users);
    console.log("[DEBUG] OTP:", otp, "Expiry:", expiry);

    // Store OTP in password_reset_token field
    const result = await db
      .update(users as any)
      .set({
        passwordResetToken: otp,
        passwordResetExpiry: expiry,
      } as any)
      .where(eq((users as any).id, user.id))
      .returning({ id: (users as any).id });

    console.log("[DEBUG] Update result:", result);

    // Log OTP to console (visible in Docker logs)
    console.log("\n" + "=".repeat(60));
    console.log("🔐 PASSWORD RESET OTP");
    console.log("=".repeat(60));
    console.log(`📧 Email: ${body.email}`);
    console.log(`🔢 OTP: ${otp}`);
    console.log(`⏰ Expires: ${expiry.toISOString()}`);
    console.log("=".repeat(60) + "\n");

    return {
      message: "If an account exists, an OTP has been sent",
      // Include OTP in dev mode for testing (remove in production)
      ...(process.env.NODE_ENV === "development" && { otp }),
    };
  } catch (error) {
    console.error("[ERROR] postAuthForgotPassword failed:", error);
    console.error("[ERROR] Stack:", (error as Error).stack);
    throw error;
  }
}

export async function postAuthResetPassword(
  env: Env,
  body: { email: string; otp: string; newPassword: string },
) {
  const db = getDb(env);

  try {
    // Find user by email
    const user = await getUserByEmail(env, body.email);
    if (!user) {
      throw new Error("Invalid email or OTP");
    }

    // Get stored OTP and expiry
    const [userRecord] = (await db
      .select({
        passwordResetToken: (users as any).passwordResetToken,
        passwordResetExpiry: (users as any).passwordResetExpiry,
      })
      .from(users as any)
      .where(eq((users as any).id, user.id))
      .limit(1)) as any;

    // Validate OTP
    if (
      !userRecord?.passwordResetToken ||
      userRecord.passwordResetToken !== body.otp
    ) {
      throw new Error("Invalid or expired OTP");
    }

    // Check expiry
    if (new Date() > new Date(userRecord.passwordResetExpiry)) {
      throw new Error("OTP has expired");
    }

    // Hash new password
    const { hashPassword } = await import("../utils/crypto.js");
    const passwordHash = await hashPassword(body.newPassword);

    // Update password and clear reset token
    await db
      .update(users as any)
      .set({
        passwordHash: passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
        updatedAt: new Date(),
      } as any)
      .where(eq((users as any).id, user.id));

    console.log("\n" + "=".repeat(60));
    console.log("✅ PASSWORD RESET SUCCESSFUL");
    console.log("=".repeat(60));
    console.log(`📧 Email: ${body.email}`);
    console.log("=".repeat(60) + "\n");

    return { message: "Password reset successfully" };
  } catch (error) {
    console.error("[ERROR] postAuthResetPassword failed:", error);
    console.error("[ERROR] Stack:", (error as Error).stack);
    throw error;
  }
}

export async function postAuth2FaSetup(_body: any, _params: any, _query: any) {
  return { message: `Generate TOTP QR code for 2FA setup` };
}

export async function postAuth2FaVerify(_body: any, _params: any, _query: any) {
  return { message: `Verify TOTP code, enable 2FA on account` };
}

export async function postAuth2FaDisable(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Disable 2FA on account` };
}

export async function postAuthDeviceToken(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Register FCM device token for push notifications` };
}

export async function deleteAuthDeviceToken(
  _body: any,
  _params: any,
  _query: any,
) {
  return { message: `Remove FCM token on logout` };
}
