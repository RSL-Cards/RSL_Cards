import { expect, test, describe } from "bun:test";
import { Elysia } from "elysia";
import { SignJWT } from "jose";
import { stripIdentityHeaders, redactForLog, loggablePath } from "./request-security.js";
import { verifyToken } from "./jwt.js";

describe("stripIdentityHeaders", () => {
  const app = new Elysia()
    .onRequest(({ request }) => stripIdentityHeaders(request))
    .get("/whoami", ({ request }) => ({
      userId: request.headers.get("x-user-id"),
      role: request.headers.get("x-user-role"),
      serviceKey: request.headers.get("x-service-key"),
      accept: request.headers.get("accept"),
    }));

  test("ignores identity headers sent by the caller", async () => {
    const res = await app.handle(
      new Request("http://localhost/whoami", {
        headers: {
          "x-user-id": "victim-id",
          "X-User-Role": "super-admin",
          "x-service-key": "guess",
          accept: "application/json",
        },
      }),
    );
    expect(await res.json()).toEqual({ userId: null, role: null, serviceKey: null, accept: "application/json" });
  });
});

describe("redactForLog", () => {
  test("masks credentials at any depth and keeps other fields", () => {
    expect(
      redactForLog({
        email: "dealer@example.com",
        password: "hunter2",
        gradeKey: "PSA_10",
        tokens: { accessToken: "a", refreshToken: "r" },
        items: [{ otp: "123456", name: "card" }],
      }),
    ).toEqual({
      email: "dealer@example.com",
      password: "[REDACTED]",
      gradeKey: "PSA_10",
      tokens: { accessToken: "[REDACTED]", refreshToken: "[REDACTED]" },
      items: [{ otp: "[REDACTED]", name: "card" }],
    });
  });
});

describe("loggablePath", () => {
  test("masks the token query parameter", () => {
    expect(loggablePath("http://localhost/v1/notifications/stream?token=abc.def&x=1")).toBe(
      "/v1/notifications/stream?token=%5BREDACTED%5D&x=1",
    );
  });
});

describe("verifyToken", () => {
  const forged = () =>
    new SignJWT({ userId: "victim-id", role: "super-admin", type: "access" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("15m")
      .sign(new TextEncoder().encode("development_secret_key"));

  const rsaEnv = (NODE_ENV: string) =>
    ({ NODE_ENV, JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY, JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY }) as any;

  test.if(Boolean(process.env.JWT_PRIVATE_KEY?.includes("BEGIN")))(
    "rejects tokens signed with the public development secret in production",
    async () => {
      await expect(verifyToken(await forged(), rsaEnv("production"))).rejects.toThrow();
      // Local development still accepts it.
      expect((await verifyToken(await forged(), rsaEnv("development"))).userId).toBe("victim-id");
    },
  );
});
