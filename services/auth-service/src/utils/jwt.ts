import jwt from 'jsonwebtoken';
import type { Env } from '../config/env.js';

export interface TokenPayload {
  userId: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate an access token and a generic secure refresh token string.
 */
export function generateTokens(payload: TokenPayload, env: Env): AuthTokens {
  const accessToken = jwt.sign(
    payload,
    env.JWT_PRIVATE_KEY || 'development_secret_key',
    {
      expiresIn: env.JWT_ACCESS_EXPIRY || '15m',
      algorithm: env.JWT_PRIVATE_KEY?.includes('BEGIN') ? 'RS256' : 'HS256'
    }
  );

  const refreshToken = jwt.sign(
    { userId: payload.userId },
    env.JWT_PRIVATE_KEY || 'development_secret_key',
    {
      expiresIn: env.JWT_REFRESH_EXPIRY || '7d',
      algorithm: env.JWT_PRIVATE_KEY?.includes('BEGIN') ? 'RS256' : 'HS256'
    }
  );

  return { accessToken, refreshToken };
}

/**
 * Verify a JWT.
 */
export function verifyToken(token: string, env: Env): any {
  return jwt.verify(token, env.JWT_PUBLIC_KEY || env.JWT_PRIVATE_KEY || 'development_secret_key', {
    algorithms: env.JWT_PUBLIC_KEY?.includes('BEGIN') ? ['RS256'] : ['HS256']
  });
}
