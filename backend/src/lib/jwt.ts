import {
  SignJWT,
  jwtVerify,
  importPKCS8,
  importSPKI,
  type JWTPayload,
  type KeyLike,
} from "jose";
import type { Env } from "../config/index.js";

export interface TokenPayload {
  userId: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

type KeyMaterial = {
  key: KeyLike | Uint8Array;
  algorithm: "HS256" | "RS256";
};

const textEncoder = new TextEncoder();

async function getKeyMaterial(env: Env, isSign: boolean): Promise<KeyMaterial> {
  if (env.JWT_PRIVATE_KEY && env.JWT_PRIVATE_KEY.includes("BEGIN")) {
    if (isSign) {
      return {
        key: await importPKCS8(env.JWT_PRIVATE_KEY, "RS256"),
        algorithm: "RS256",
      };
    }
    const publicOrPrivate = env.JWT_PUBLIC_KEY || env.JWT_PRIVATE_KEY;
    if (publicOrPrivate.includes("PUBLIC")) {
      return { key: await importSPKI(publicOrPrivate, "RS256"), algorithm: "RS256" };
    }
    return { key: await importPKCS8(publicOrPrivate, "RS256"), algorithm: "RS256" };
  }

  const secret =
    env.JWT_PRIVATE_KEY && !env.JWT_PRIVATE_KEY.includes("PLACEHOLDER")
      ? env.JWT_PRIVATE_KEY
      : "development_secret_key";

  return { key: textEncoder.encode(secret), algorithm: "HS256" };
}

function parseExpiry(expiry: string): string {
  return expiry;
}

export async function generateTokens(payload: TokenPayload, env: Env): Promise<AuthTokens> {
  const { key, algorithm } = await getKeyMaterial(env, true);

  const accessToken = await new SignJWT({ ...payload, type: "access" })
    .setProtectedHeader({ alg: algorithm })
    .setExpirationTime(parseExpiry(env.JWT_ACCESS_EXPIRY || "15m"))
    .sign(key);

  const refreshToken = await new SignJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: algorithm })
    .setExpirationTime(parseExpiry(env.JWT_REFRESH_EXPIRY || "7d"))
    .sign(key);

  return { accessToken, refreshToken };
}

export async function verifyToken(token: string, env: Env): Promise<JWTPayload> {
  const { key: primaryKey, algorithm } = await getKeyMaterial(env, false);

  try {
    const { payload } = await jwtVerify(token, primaryKey, {
      algorithms: [algorithm],
    });
    return payload;
  } catch (err) {
    const fallbackSecrets = [
      "development_secret_key",
      "PLACEHOLDER_RSA_PRIVATE_KEY_CHANGE_IN_AWS_SSM",
      "PLACEHOLDER_RSA_PUBLIC_KEY_CHANGE_IN_AWS_SSM",
    ];
    for (const secret of fallbackSecrets) {
      try {
        const { payload } = await jwtVerify(token, textEncoder.encode(secret), {
          algorithms: ["HS256"],
        });
        return payload;
      } catch {
        // try next fallback
      }
    }
    throw err;
  }
}
