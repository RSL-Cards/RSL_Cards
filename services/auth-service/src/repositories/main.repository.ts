import { eq } from 'drizzle-orm';
import { users, refreshTokens, dealerProfiles, consumerProfiles, userPreferences } from '@rsl/shared-db';
import { getDb } from '../config/db.js';
import type { Env } from '../config/env.js';

export type UserRow = {
  id: string;
  email: string;
  passwordHash: string | null;
  role: 'dealer' | 'consumer' | 'admin';
};

export async function createUser(env: Env, data: { email: string; passwordHash: string; role: 'dealer' | 'consumer' }): Promise<UserRow> {
  const db = getDb(env);
  
  return await db.transaction(async (tx: any) => {
    // 1. Insert user
    const [user] = await tx.insert(users).values({
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role
    }).returning() as any;

    const displayName = data.email.split('@')[0] || 'User';

    // 2. Insert Profile
    if (data.role === 'dealer') {
      await tx.insert(dealerProfiles).values({
        userId: user.id,
        displayName: displayName
      });
    } else {
      await tx.insert(consumerProfiles).values({
        userId: user.id,
        displayName: displayName
      });
    }

    // 3. Insert Preferences
    await tx.insert(userPreferences).values({
      userId: user.id
    });

    return user;
  });
}

export async function getUserByEmail(env: Env, email: string): Promise<UserRow | null> {
  const db = getDb(env);
  const [user] = await db.select().from(users as any).where(eq((users as any).email, email)).limit(1) as any;
  return user || null;
}

export async function getUserById(env: Env, id: string): Promise<UserRow | null> {
  const db = getDb(env);
  const [user] = await db.select().from(users as any).where(eq((users as any).id, id)).limit(1) as any;
  return user || null;
}

export async function updateRefreshToken(env: Env, userId: string, tokenHash: string | null, expiresAt?: Date) {
  const db = getDb(env);
  // Simple "single session per user" model for right now:
  await db.delete(refreshTokens as any).where(eq((refreshTokens as any).userId, userId));
  
  if (tokenHash) {
    const expires = expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days fallback
    await db.insert(refreshTokens as any).values({
      userId: userId,
      tokenHash: tokenHash,
      expiresAt: expires
    });
  }
}

export async function getRefreshToken(env: Env, tokenHash: string) {
  const db = getDb(env);
  const [tokenRecord] = await db.select().from(refreshTokens as any).where(eq((refreshTokens as any).tokenHash, tokenHash)).limit(1) as any;
  return tokenRecord || null;
}

/// Stubs for extended auth paths

export async function postAuthOauthGoogle(_body: any, _params: any, _query: any) {
  return { message: `Google OAuth sign-in / sign-up. Returns tokens` };
}

export async function postAuthOauthApple(_body: any, _params: any, _query: any) {
  return { message: `Apple Sign-In. Returns tokens` };
}

export async function postAuthVerifyEmail(_body: any, _params: any, _query: any) {
  return { message: `Verify email with token sent to inbox` };
}

export async function postAuthForgotPassword(_body: any, _params: any, _query: any) {
  return { message: `Send password reset email` };
}

export async function postAuthResetPassword(_body: any, _params: any, _query: any) {
  return { message: `Reset password using token from email` };
}

export async function postAuth2FaSetup(_body: any, _params: any, _query: any) {
  return { message: `Generate TOTP QR code for 2FA setup` };
}

export async function postAuth2FaVerify(_body: any, _params: any, _query: any) {
  return { message: `Verify TOTP code, enable 2FA on account` };
}

export async function postAuth2FaDisable(_body: any, _params: any, _query: any) {
  return { message: `Disable 2FA on account` };
}

export async function postAuthDeviceToken(_body: any, _params: any, _query: any) {
  return { message: `Register FCM device token for push notifications` };
}

export async function deleteAuthDeviceToken(_body: any, _params: any, _query: any) {
  return { message: `Remove FCM token on logout` };
}
