import { randomInt, timingSafeEqual } from "node:crypto";
import { redisAdapter } from "../adapters/redis.adapter.js";
import { AuthError, AuthErrorCode } from "./errors.js";

// A 6-digit code has 900,000 possibilities, so guesses and resends must be capped or the
// code can be brute-forced within its lifetime.
const MAX_FAILED_ATTEMPTS = 5;
const MAX_CODES_PER_WINDOW = 5;
const WINDOW_SECONDS = 15 * 60;

const failuresKey = (scope: string, email: string) => `rsl-cards:v1:otp-failures:${scope}:${email}`;
const sendsKey = (scope: string, email: string) => `rsl-cards:v1:otp-sends:${scope}:${email}`;
const tooMany = (message: string) => new AuthError(AuthErrorCode.RATE_LIMITED, message, 429);

async function increment(key: string) {
  const client = redisAdapter.getClient();
  const count = await client.incr(key);
  if (count === 1) await client.expire(key, WINDOW_SECONDS);
  return count;
}

export function generateOtp() {
  return randomInt(100000, 1000000).toString();
}

export function otpMatches(expected: string | null | undefined, provided: unknown) {
  if (!expected || typeof provided !== "string") return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(provided.trim());
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Call before sending a new code; throws once too many codes were requested recently. */
export async function assertCanSendOtp(scope: string, email: string) {
  if ((await increment(sendsKey(scope, email))) > MAX_CODES_PER_WINDOW) {
    throw tooMany("Too many verification codes requested. Please wait 15 minutes and try again.");
  }
}

/** Call before checking a code; throws while the email is locked out after repeated wrong codes. */
export async function assertOtpAttemptsLeft(scope: string, email: string) {
  const failures = Number((await redisAdapter.get(failuresKey(scope, email))) ?? 0);
  if (failures >= MAX_FAILED_ATTEMPTS) {
    throw tooMany("Too many failed attempts. Please wait 15 minutes and try again.");
  }
}

/**
 * Records a wrong code (or password); after the limit the stored code is discarded so it can't be
 * guessed further. Returns true on the attempt that triggers the lockout.
 */
export async function recordFailedOtp(scope: string, email: string, otpKey?: string) {
  const failures = await increment(failuresKey(scope, email));
  if (failures >= MAX_FAILED_ATTEMPTS && otpKey) await redisAdapter.delete(otpKey);
  return failures === MAX_FAILED_ATTEMPTS;
}

export async function clearOtpFailures(scope: string, email: string) {
  await redisAdapter.delete(failuresKey(scope, email));
}
