import type { FastifyInstance } from "fastify";
import { z } from 'zod';
import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getDb } from "../config/db.js";
import { getRedis } from "../config/redis.js";
import { AuthRepository } from "../repositories/auth.repository.js";
import { AuthService } from "../services/auth.service.js";
import { AuthController } from "../controllers/auth.controller.js";
import { internalAuthPreHandler } from "../middleware/internal-auth.js";
import {
  RegisterSchema,
  LoginSchema,
  RefreshSchema,
  LogoutSchema,
  OnboardingSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "../types/schemas.js";
import {
  requireGatewayAccessToken,
  requireAdminRole,
} from "../middleware/gateway-jwt.js";

export async function authRoutes(app: FastifyInstance) {
  const env = (app as any).env as Env;

  // Dependency Injection
  const authRepository = new AuthRepository(env);
  const authService = new AuthService(authRepository, env);
  const authController = new AuthController(authService, env);

  // Global internal security check
  app.addHook("preHandler", internalAuthPreHandler);

  // Helper for auth middleware
  const withAuth = { preHandler: [(req: any, res: any) => requireGatewayAccessToken(env, req, res)] };
  const withAdminAuth = { preHandler: [(req: any, res: any) => requireGatewayAccessToken(env, req, res), requireAdminRole] };

  // ── Public Routes ──
  app.post("/register", { schema: { body: RegisterSchema } }, authController.register);
  app.post("/login", { schema: { body: LoginSchema } }, authController.login);
  app.post("/refresh", { schema: { body: RefreshSchema } }, authController.refresh);
  app.post("/logout", { schema: { body: LogoutSchema } }, authController.logout);
  app.post("/forgot-password", { schema: { body: ForgotPasswordSchema } }, authController.forgotPassword);
  app.post("/reset-password", { schema: { body: ResetPasswordSchema } }, authController.resetPassword);

  // ── Protected Routes (Proxy) ──
  app.post("/onboarding", { ...withAuth, schema: { body: OnboardingSchema } }, authController.onboarding);
  app.get("/me/payment-methods", withAuth, authController.getPaymentMethods);
  app.get("/me/connected-platforms", withAuth, authController.getConnectedPlatforms);

  // ── Admin ──
  app.post("/admin-demo", withAdminAuth, authController.adminDemo);

  // ── OAuth & Other Stubs ──
  app.post("/oauth/google", async (req, reply) => reply.send(await authRepository.postAuthOauthGoogle(req.body, req.params, req.query)));
  app.post("/oauth/apple", async (req, reply) => reply.send(await authRepository.postAuthOauthApple(req.body, req.params, req.query)));
  app.post("/verify-email", async (req, reply) => reply.send(await authRepository.postAuthVerifyEmail(req.body, req.params, req.query)));
  app.post("/2fa/setup", async (req, reply) => reply.send(await authRepository.postAuth2FaSetup(req.body, req.params, req.query)));
  app.post("/2fa/verify", async (req, reply) => reply.send(await authRepository.postAuth2FaVerify(req.body, req.params, req.query)));
  app.post("/2fa/disable", async (req, reply) => reply.send(await authRepository.postAuth2FaDisable(req.body, req.params, req.query)));
  app.post("/device-token", async (req, reply) => reply.send(await authRepository.postAuthDeviceToken(req.body, req.params, req.query)));
  app.delete("/device-token", async (req, reply) => reply.send(await authRepository.deleteAuthDeviceToken(req.body, req.params, req.query)));

  // Ping
  app.post("/ping", { schema: { body: z.object({ message: z.string() }) } }, async (request, reply) => {
    const body = request.body as { message: string };
    let db_connected = false;
    try { await getDb(env).execute(sql`SELECT 1`); db_connected = true; } catch { db_connected = false; }
    let redis_connected = false;
    try { redis_connected = (await getRedis(env).ping()) === "PONG"; } catch { redis_connected = false; }
    return reply.send({
      service: "auth-service",
      received: body.message,
      environment: env.NODE_ENV,
      db_connected,
      redis_connected,
      timestamp: new Date().toISOString(),
    });
  });
}
