import { describe, expect, it, beforeAll, afterAll, beforeEach } from "vitest";
import { initTestApp, resetDb, shutdownTestApp } from "./test-helper.js";
import { FastifyInstance } from "fastify";

describe("Signup Integration Tests", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await initTestApp();
  });

  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await shutdownTestApp();
  });

  it("should successfully sign up a new user", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: {
        email: "test-signup@rsl.test",
        password: "Password123!",
        role: "dealer"
      }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.user.email).toBe("test-signup@rsl.test");
    expect(body.user.role).toBe("dealer");
    expect(body.tokens).toHaveProperty("accessToken");
    expect(body.tokens).toHaveProperty("refreshToken");
  });

  it("should fail if email already exists", async () => {
    // 1. First signup
    await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: {
        email: "duplicate@rsl.test",
        password: "Password123!",
        role: "consumer"
      }
    });

    // 2. Second signup with same email
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: {
        email: "duplicate@rsl.test",
        password: "Password123!",
        role: "consumer"
      }
    });

    expect(response.statusCode).toBe(409);
    const body = JSON.parse(response.payload);
    expect(body.error.code).toBe("AUTH_USER_ALREADY_EXISTS");
  });

  it("should fail on invalid email format", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: {
        email: "not-an-email",
        password: "Password123!",
        role: "dealer"
      }
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.error.code).toBe("ZOD");
  });
});
