import type { Env } from '../config/env.js';
import * as repo from '../repositories/main.repository.js';
import { hashPassword, comparePassword, hashToken } from '../utils/crypto.js';
import { generateTokens, verifyToken } from '../utils/jwt.js';
import type { RegisterBody, LoginBody, RefreshBody, LogoutBody } from '../types/schemas.js';
import { AuthError, AuthErrorCode } from '../errors/definitions.js';

export async function registerUser(env: Env, body: RegisterBody) {
  const existingUser = await repo.getUserByEmail(env, body.email);
  if (existingUser) {
    throw AuthError.userAlreadyExists();
  }

  const pwdHash = await hashPassword(body.password);
  const newUser = await repo.createUser(env, { email: body.email, passwordHash: pwdHash, role: body.role as any });

  const tokens = generateTokens({ userId: newUser.id, role: newUser.role }, env);
  const refreshTokenHash = hashToken(tokens.refreshToken);
  
  // Calculate expiration date (fallback to +7d if verify fails structure)
  let expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  try {
    const decoded = verifyToken(tokens.refreshToken, env);
    if (decoded && decoded.exp) {
      expiresAt = new Date(decoded.exp * 1000);
    }
  } catch (e) {}

  await repo.updateRefreshToken(env, newUser.id, refreshTokenHash, expiresAt);

  return {
    user: { id: newUser.id, email: newUser.email, role: newUser.role },
    tokens
  };
}

export async function loginUser(env: Env, body: LoginBody) {
  const user = await repo.getUserByEmail(env, body.email);
  if (!user || !user.passwordHash) {
    throw AuthError.invalidCredentials();
  }

  const validPassword = await comparePassword(body.password, user.passwordHash);
  if (!validPassword) {
    throw AuthError.invalidCredentials();
  }

  const tokens = generateTokens({ userId: user.id, role: user.role }, env);
  const refreshTokenHash = hashToken(tokens.refreshToken);
  
  let expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  try {
    const decoded = verifyToken(tokens.refreshToken, env);
    if (decoded && decoded.exp) {
      expiresAt = new Date(decoded.exp * 1000);
    }
  } catch (e) {}

  await repo.updateRefreshToken(env, user.id, refreshTokenHash, expiresAt);

  return {
    user: { id: user.id, email: user.email, role: user.role },
    tokens
  };
}

export async function refreshTokens(env: Env, body: RefreshBody) {
  let decoded;
  try {
    decoded = verifyToken(body.refreshToken, env);
  } catch (err) {
    throw new AuthError(AuthErrorCode.INVALID_REFRESH_TOKEN, 'Invalid or expired refresh token', 401);
  }

  const user = await repo.getUserById(env, decoded.userId);
  if (!user) {
    throw new AuthError(AuthErrorCode.USER_NOT_FOUND, 'User not found', 404);
  }

  const incomingHash = hashToken(body.refreshToken);
  const tokenRecord = await repo.getRefreshToken(env, incomingHash);
  
  if (!tokenRecord || tokenRecord.userId !== user.id) {
    // Stolen token reuse attempt OR token no longer exists
    throw new AuthError(AuthErrorCode.INVALID_REFRESH_TOKEN, 'Invalid refresh token', 401);
  }

  const newTokens = generateTokens({ userId: user.id, role: user.role }, env);
  const newHash = hashToken(newTokens.refreshToken);
  
  let expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  try {
    const decodedNew = verifyToken(newTokens.refreshToken, env);
    if (decodedNew && decodedNew.exp) {
      expiresAt = new Date(decodedNew.exp * 1000);
    }
  } catch (e) {}
  
  await repo.updateRefreshToken(env, user.id, newHash, expiresAt);

  return { tokens: newTokens };
}

export async function logoutUser(env: Env, body: LogoutBody) {
  if (!body.refreshToken) return { success: true };

  let decoded;
  try {
    decoded = verifyToken(body.refreshToken, env);
  } catch (err) {
    return { success: true }; // ignore invalid token on logout
  }

  // Clear hash in DB
  await repo.updateRefreshToken(env, decoded.userId, null);
  return { success: true };
}
