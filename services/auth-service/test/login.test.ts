import { describe, expect, it, beforeAll, afterAll, beforeEach } from "vitest";
import { initTestApp, resetDb, shutdownTestApp } from "./test-helper.js";
import { FastifyInstance } from "fastify";

describe("Login Integration Tests", () => {
  let app: FastifyInstance | undefined;

  beforeAll(async () => {
    const result = await initTestApp();
    if (result) app = result;
  });

  beforeEach(async () => {
    if (!app) return;
    await resetDb();
  });

  afterAll(async () => {
    await shutdownTestApp();
  });

  it("should successfully log in an existing user", async () => {
    if (!app) return;
    const email = "login-success@rsl.test";
    const password = "Password123!";

    // 1. Signup
    await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: {
        email,
        password,
        role: "dealer",
      },
    });

    // 2. Login
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: {
        email,
        password,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.user.email).toBe(email);
    expect(body.tokens).toHaveProperty("accessToken");
    expect(body.tokens).toHaveProperty("refreshToken");
  });

  it("should fail with incorrect password", async () => {
    if (!app) return;
    const email = "wrong-password@rsl.test";
    const password = "CorrectPassword123!";

    // 1. Signup
    await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: {
        email,
        password,
        role: "consumer",
      },
    });

    // 2. Login with wrong password
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: {
        email,
        password: "WrongPassword123!",
      },
    });

    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.error.code).toBe("AUTH_INVALID_CREDENTIALS");
  });

  it("should fail for non-existent user", async () => {
    if (!app) return;
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: {
        email: "non-existent@rsl.test",
        password: "SomePassword123!",
      },
    });

    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.error.code).toBe("AUTH_INVALID_CREDENTIALS");
  });
});
