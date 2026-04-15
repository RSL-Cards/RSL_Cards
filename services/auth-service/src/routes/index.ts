import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import * as controller from "../controllers/main.controller.js";
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
import { authRoutes } from "./auth.routes.js";
import { healthRoutes } from "./health.routes.js";
import type { Env } from "../config/env.js";

// ─── Reusable preHandler factories ───────────────────────────────────────────

const withAuth = (env: Env) => (req: FastifyRequest, res: FastifyReply) =>
  requireGatewayAccessToken(env, req, res);

const withAdminAuth = (env: Env) => [withAuth(env), requireAdminRole];

// ─── Shared Swagger tag / security shorthand ──────────────────────────────────

const AUTH_TAG = { tags: ["Auth"] } as const;
const BEARER_SEC = { security: [{ bearerAuth: [] }] } as const;

// ─────────────────────────────────────────────────────────────────────────────

export async function registerRoutes(fastifyApp: FastifyInstance, env: Env) {
  const app = fastifyApp.withTypeProvider<ZodTypeProvider>();

  // ── Public auth routes ────────────────────────────────────────────────────

  app.post(
    "/v1/auth/register",
    {
      schema: {
        ...AUTH_TAG,
        description: "Register a new user",
        body: RegisterSchema,
      },
    },
    controller.postAuthRegister,
  );

  app.post(
    "/v1/auth/login",
    {
      schema: {
        ...AUTH_TAG,
        description: "Login and receive JWT tokens",
        body: LoginSchema,
      },
    },
    controller.postAuthLogin,
  );

  app.post(
    "/v1/auth/logout",
    {
      schema: {
        ...AUTH_TAG,
        description: "Invalidate refresh token",
        body: LogoutSchema,
      },
    },
    controller.postAuthLogout,
  );

  app.post(
    "/v1/auth/refresh",
    {
      schema: {
        ...AUTH_TAG,
        description: "Rotate access and refresh tokens",
        body: RefreshSchema,
      },
    },
    controller.postAuthRefresh,
  );

  // ── Protected auth routes ─────────────────────────────────────────────────

  app.post(
    "/v1/auth/onboarding",
    {
      schema: {
        ...AUTH_TAG,
        ...BEARER_SEC,
        description: "Save dealer onboarding data — proxied to user-service",
        body: OnboardingSchema,
      },
      preHandler: [withAuth(env)],
    },
    controller.postAuthOnboarding,
  );

  // ── OAuth ─────────────────────────────────────────────────────────────────

  app.post("/v1/auth/oauth/google", controller.postAuthOauthGoogle);
  app.post("/v1/auth/oauth/apple", controller.postAuthOauthApple);

  // ── Email / password flows ────────────────────────────────────────────────

  app.post("/v1/auth/verify-email", controller.postAuthVerifyEmail);

  app.post(
    "/v1/auth/forgot-password",
    {
      schema: {
        ...AUTH_TAG,
        description: "Request password reset OTP",
        body: ForgotPasswordSchema,
      },
    },
    controller.postAuthForgotPassword,
  );

  app.post(
    "/v1/auth/reset-password",
    {
      schema: {
        ...AUTH_TAG,
        description: "Reset password using OTP",
        body: ResetPasswordSchema,
      },
    },
    controller.postAuthResetPassword,
  );

  // ── Two-factor authentication ─────────────────────────────────────────────

  app.post("/v1/auth/2fa/setup", controller.postAuth2FaSetup);
  app.post("/v1/auth/2fa/verify", controller.postAuth2FaVerify);
  app.post("/v1/auth/2fa/disable", controller.postAuth2FaDisable);

  // ── Device / push token ───────────────────────────────────────────────────

  app.post("/v1/auth/device-token", controller.postAuthDeviceToken);
  app.delete("/v1/auth/device-token", controller.deleteAuthDeviceToken);

  // ── User profile proxy routes (JWT validated here, forwarded to user-service) ──

  app.get(
    "/v1/auth/me/payment-methods",
    {
      schema: {
        ...AUTH_TAG,
        ...BEARER_SEC,
        description: "Get saved payment methods",
      },
      preHandler: [withAuth(env)],
    },
    controller.getAuthMePaymentMethods,
  );

  app.get(
    "/v1/auth/me/connected-platforms",
    {
      schema: {
        ...AUTH_TAG,
        ...BEARER_SEC,
        description: "Get connected selling platforms",
      },
      preHandler: [withAuth(env)],
    },
    controller.getAuthMeConnectedPlatforms,
  );

  // ── Admin-only demo ───────────────────────────────────────────────────────

  app.post(
    "/v1/auth/admin-demo",
    {
      schema: {
        tags: ["Admin"],
        ...BEARER_SEC,
        description: "Admin-only access demonstration",
      },
      preHandler: withAdminAuth(env),
    },
    controller.postAuthAdminDemo,
  );

  // ── Split route modules ───────────────────────────────────────────────────

  await authRoutes(fastifyApp, env);
  await healthRoutes(fastifyApp, env);
}
