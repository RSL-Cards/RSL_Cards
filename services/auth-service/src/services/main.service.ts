import type { Env } from '../config/env.js';
import * as repo from '../repositories/main.repository.js';
import { hashPassword, comparePassword, hashToken } from '../utils/crypto.js';
import { generateTokens, verifyToken } from '../utils/jwt.js';
import type { RegisterBody, LoginBody, RefreshBody, LogoutBody } from '../types/schemas.js';

export async function registerUser(env: Env, body: RegisterBody) {
  const existingUser = await repo.getUserByEmail(env, body.email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const pwdHash = await hashPassword(body.password);
  const newUser = await repo.createUser(env, { email: body.email, passwordHash: pwdHash, role: body.role as any });

  const tokens = generateTokens({ userId: newUser.id, role: newUser.role }, env);
  const refreshTokenHash = hashToken(tokens.refreshToken);
  
  await repo.updateRefreshToken(env, newUser.id, refreshTokenHash);

  return {
    user: { id: newUser.id, email: newUser.email, role: newUser.role },
    tokens
  };
}

export async function loginUser(env: Env, body: LoginBody) {
  const user = await repo.getUserByEmail(env, body.email);
  if (!user || !user.passwordHash) {
    throw new Error('Invalid email or password');
  }

  const validPassword = await comparePassword(body.password, user.passwordHash);
  if (!validPassword) {
    throw new Error('Invalid email or password');
  }

  const tokens = generateTokens({ userId: user.id, role: user.role }, env);
  const refreshTokenHash = hashToken(tokens.refreshToken);
  
  await repo.updateRefreshToken(env, user.id, refreshTokenHash);

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
    throw new Error('Invalid or expired refresh token');
  }

  const user = await repo.getUserById(env, decoded.userId);
  if (!user) {
    throw new Error('User not found');
  }

  const incomingHash = hashToken(body.refreshToken);
  if (user.refreshTokenHash !== incomingHash) {
    // Possibly a stolen token reuse attempt
    throw new Error('Invalid refresh token');
  }

  const newTokens = generateTokens({ userId: user.id, role: user.role }, env);
  const newHash = hashToken(newTokens.refreshToken);
  
  await repo.updateRefreshToken(env, user.id, newHash);

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
