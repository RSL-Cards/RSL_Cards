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

function getSecret(env: Env, isSign = false): { secret: string; algorithm: jwt.Algorithm } {
  if (env.JWT_PRIVATE_KEY && env.JWT_PRIVATE_KEY.includes("BEGIN")) {
    return {
      secret: isSign ? env.JWT_PRIVATE_KEY : (env.JWT_PUBLIC_KEY || env.JWT_PRIVATE_KEY),
      algorithm: "RS256",
    };
  }

  const secret =
    env.JWT_PRIVATE_KEY && !env.JWT_PRIVATE_KEY.includes("PLACEHOLDER")
      ? env.JWT_PRIVATE_KEY
      : "development_secret_key";

  return { secret, algorithm: "HS256" };
}

export function generateTokens(payload: TokenPayload, env: Env): AuthTokens {
  const { secret, algorithm } = getSecret(env, true);

  const accessToken = jwt.sign(
    { ...payload, type: "access" },
    secret,
    {
      expiresIn: (env.JWT_ACCESS_EXPIRY || "15m") as any,
      algorithm,
    },
  );

  const refreshToken = jwt.sign(
    { userId: payload.userId },
    secret,
    {
      expiresIn: (env.JWT_REFRESH_EXPIRY || "7d") as any,
      algorithm,
    },
  );

  return { accessToken, refreshToken };
}

export function verifyToken(token: string, env: Env): any {
  const { secret: primarySecret } = getSecret(env, false);

  try {
    return jwt.verify(token, primarySecret, {
      algorithms: primarySecret.includes("BEGIN") ? ["RS256"] : ["HS256"],
    });
  } catch (err) {
    const fallbackSecrets = [
      "development_secret_key",
      "PLACEHOLDER_RSA_PRIVATE_KEY_CHANGE_IN_AWS_SSM",
      "PLACEHOLDER_RSA_PUBLIC_KEY_CHANGE_IN_AWS_SSM",
    ];
    for (const secret of fallbackSecrets) {
      if (secret !== primarySecret) {
        try {
          return jwt.verify(token, secret, { algorithms: ["HS256"] });
        } catch (e) {}
      }
    }
    throw err;
  }
}
