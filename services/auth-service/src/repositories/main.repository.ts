import { eq } from 'drizzle-orm';
import { users } from '@rsl/shared-db';
import { getDb } from '../config/db.js';
import type { Env } from '../config/env.js';

export type UserRow = {
  id: string;
  email: string;
  passwordHash: string | null;
  role: 'dealer' | 'consumer' | 'admin';
  refreshTokenHash: string | null;
};

export async function createUser(env: Env, data: { email: string; passwordHash: string; role: 'dealer' | 'consumer' }): Promise<UserRow> {
  const db = getDb(env);
  const [user] = await db.insert(users as any).values({
    email: data.email,
    passwordHash: data.passwordHash,
    role: data.role
  }).returning() as any;
  return user;
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

export async function updateRefreshToken(env: Env, userId: string, refreshTokenHash: string | null) {
  const db = getDb(env);
  await db.update(users as any).set({ refreshTokenHash, updatedAt: new Date() }).where(eq((users as any).id, userId));
}

/// Stubs for extended auth paths

export async function postAuthOauthGoogle(body: any, params: any, query: any) {
  return { message: `Google OAuth sign-in / sign-up. Returns tokens` };
}

export async function postAuthOauthApple(body: any, params: any, query: any) {
  return { message: `Apple Sign-In. Returns tokens` };
}

export async function postAuthVerifyEmail(body: any, params: any, query: any) {
  return { message: `Verify email with token sent to inbox` };
}

export async function postAuthForgotPassword(body: any, params: any, query: any) {
  return { message: `Send password reset email` };
}

export async function postAuthResetPassword(body: any, params: any, query: any) {
  return { message: `Reset password using token from email` };
}

export async function postAuth2FaSetup(body: any, params: any, query: any) {
  return { message: `Generate TOTP QR code for 2FA setup` };
}

export async function postAuth2FaVerify(body: any, params: any, query: any) {
  return { message: `Verify TOTP code, enable 2FA on account` };
}

export async function postAuth2FaDisable(body: any, params: any, query: any) {
  return { message: `Disable 2FA on account` };
}

export async function postAuthDeviceToken(body: any, params: any, query: any) {
  return { message: `Register FCM device token for push notifications` };
}

export async function deleteAuthDeviceToken(body: any, params: any, query: any) {
  return { message: `Remove FCM token on logout` };
}
