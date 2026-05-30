import jwt from "jsonwebtoken";
import type { Env } from "../config/index.js";

export interface TokenPayload {
  userId: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export function generateTokens(payload: TokenPayload, env: Env): AuthTokens {
  const accessToken = jwt.sign(
    { ...payload, type: "access" },
    env.JWT_PRIVATE_KEY || "development_secret_key",
    {
      expiresIn: (env.JWT_ACCESS_EXPIRY || "15m") as any,
      algorithm: (env.JWT_PRIVATE_KEY?.includes("BEGIN")
        ? "RS256"
        : "HS256") as jwt.Algorithm,
    },
  );

  const refreshToken = jwt.sign(
    { userId: payload.userId },
    env.JWT_PRIVATE_KEY || "development_secret_key",
    {
      expiresIn: (env.JWT_REFRESH_EXPIRY || "7d") as any,
      algorithm: (env.JWT_PRIVATE_KEY?.includes("BEGIN")
        ? "RS256"
        : "HS256") as jwt.Algorithm,
    },
  );

  return { accessToken, refreshToken };
}

export function verifyToken(token: string, env: Env): any {
  return jwt.verify(
    token,
    env.JWT_PUBLIC_KEY || env.JWT_PRIVATE_KEY || "development_secret_key",
    {
      algorithms: env.JWT_PUBLIC_KEY?.includes("BEGIN") ? ["RS256"] : ["HS256"],
    },
  );
}
