import { expect, test, describe } from "bun:test";
import { redisAdapter } from "../adapters/redis.adapter.js";
import {
  generateOtp,
  otpMatches,
  assertCanSendOtp,
  assertOtpAttemptsLeft,
  recordFailedOtp,
  clearOtpFailures,
} from "./otp-guard.js";

describe("otp-guard", () => {
  test("generates 6-digit codes and compares them exactly", () => {
    const code = generateOtp();
    expect(code).toMatch(/^\d{6}$/);
    expect(otpMatches(code, code)).toBe(true);
    expect(otpMatches(code, ` ${code} `)).toBe(true);
    expect(otpMatches(code, "000000" === code ? "111111" : "000000")).toBe(false);
    expect(otpMatches(null, code)).toBe(false);
    expect(otpMatches(code, undefined)).toBe(false);
  });

  test("locks an email out after 5 wrong codes and discards the stored code", async () => {
    const email = `lockout-${Date.now()}@rslcards.com`;
    const otpKey = `rsl-cards:v1:otp:test:${email}`;
    await redisAdapter.set(otpKey, "123456", 300);

    for (let i = 0; i < 4; i++) {
      await assertOtpAttemptsLeft("test", email);
      expect(await recordFailedOtp("test", email, otpKey)).toBe(false);
    }
    expect(await recordFailedOtp("test", email, otpKey)).toBe(true);
    await expect(assertOtpAttemptsLeft("test", email)).rejects.toThrow("Too many failed attempts");
    expect(await redisAdapter.get(otpKey)).toBeNull();

    await clearOtpFailures("test", email);
    await assertOtpAttemptsLeft("test", email);
  });

  test("limits how many codes can be requested per window", async () => {
    const email = `sends-${Date.now()}@rslcards.com`;
    for (let i = 0; i < 5; i++) await assertCanSendOtp("test", email);
    await expect(assertCanSendOtp("test", email)).rejects.toThrow("Too many verification codes");
  });
});
