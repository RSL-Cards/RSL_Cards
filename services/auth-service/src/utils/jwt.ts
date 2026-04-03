import jwt, { type SignOptions } from "jsonwebtoken";
import type { Env } from "../config/env.js";
import type { JwtPayload } from "../types/index.js";

function useHs256Fallback(env: Env): boolean {
  return (
    env.JWT_PRIVATE_KEY.includes("REPLACE") ||
    env.JWT_PUBLIC_KEY.includes("REPLACE") ||
    env.JWT_PRIVATE_KEY.length < 50
  );
}

export function signAccessToken(
  env: Env,
  payload: JwtPayload,
  logger?: { warn: (o: Record<string, unknown>) => void },
): string {
  const pl = { ...payload, type: "access" as const };
  if (useHs256Fallback(env)) {
    logger?.warn({ msg: "JWT: using temporary HS256; set RS256 keys for production" });
    const o: SignOptions = {
      algorithm: "HS256",
      expiresIn: env.JWT_ACCESS_EXPIRY as SignOptions["expiresIn"],
    };
    return jwt.sign(pl, "temp-dev-secret", o);
  }
  const o: SignOptions = {
    algorithm: "RS256",
    expiresIn: env.JWT_ACCESS_EXPIRY as SignOptions["expiresIn"],
  };
  return jwt.sign(pl, env.JWT_PRIVATE_KEY, o);
}

export function signRefreshToken(
  env: Env,
  userId: string,
  logger?: { warn: (o: Record<string, unknown>) => void },
): string {
  const pl: JwtPayload = { sub: userId, type: "refresh" };
  if (useHs256Fallback(env)) {
    logger?.warn({ msg: "JWT refresh: using temporary HS256" });
    const o: SignOptions = {
      algorithm: "HS256",
      expiresIn: env.JWT_REFRESH_EXPIRY as SignOptions["expiresIn"],
    };
    return jwt.sign(pl, "temp-dev-secret", o);
  }
  const o: SignOptions = {
    algorithm: "RS256",
    expiresIn: env.JWT_REFRESH_EXPIRY as SignOptions["expiresIn"],
  };
  return jwt.sign(pl, env.JWT_PRIVATE_KEY, o);
}

export function verifyToken(env: Env, token: string): JwtPayload {
  if (useHs256Fallback(env)) {
    return jwt.verify(token, "temp-dev-secret", { algorithms: ["HS256"] }) as JwtPayload;
  }
  return jwt.verify(token, env.JWT_PUBLIC_KEY, { algorithms: ["RS256"] }) as JwtPayload;
}
