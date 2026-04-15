import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import * as controller from "../controllers/main.controller.js";
import {
  RegisterSchema,
  LoginSchema,
  RefreshSchema,
  LogoutSchema,
  OnboardingSchema,
} from "../types/schemas.js";
import {
  requireGatewayAccessToken,
  requireAdminRole,
} from "../middleware/gateway-jwt.js";
import { updateOnboarding } from "../repositories/main.repository.js";
import { authRoutes } from "./auth.routes.js";
import { healthRoutes } from "./health.routes.js";

export async function registerRoutes(fastifyApp: FastifyInstance, env: any) {
  const app = fastifyApp.withTypeProvider<ZodTypeProvider>();

  app.post(
    "/v1/auth/register",
    {
      schema: {
        description: "Register a new user",
        tags: ["Auth"],
        body: RegisterSchema,
      },
    },
    controller.postAuthRegister,
  );

  app.post(
    "/v1/auth/login",
    {
      schema: {
        description: "Login mathematically via JWT",
        tags: ["Auth"],
        body: LoginSchema,
      },
    },
    controller.postAuthLogin,
  );

  app.post(
    "/v1/auth/logout",
    {
      schema: {
        description: "Logout user explicitly clearing tokens",
        tags: ["Auth"],
        body: LogoutSchema,
      },
    },
    controller.postAuthLogout,
  );

  app.post(
    "/v1/auth/refresh",
    {
      schema: {
        description: "Rotate Access Tokens securely",
        tags: ["Auth"],
        body: RefreshSchema,
      },
    },
    controller.postAuthRefresh,
  );

  app.post(
    "/v1/auth/onboarding",
    {
      schema: {
        description:
          "Save onboarding data (sports, sell channels, payment methods) for dealer profile",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        body: OnboardingSchema,
      },
      preHandler: [(req, res) => requireGatewayAccessToken(env, req, res)],
    },
    async (request, reply) => {
      const jwt = (request as any).gatewayJwt;
      await updateOnboarding(env, jwt.userId, request.body as any);
      return reply.send({ success: true });
    },
  );

  // --- DEMO ADMIN ROUTE ---
  app.post(
    "/v1/auth/admin-demo",
    {
      schema: {
        description: "Secure endpoint strictly locked to Admins only",
        tags: ["Admin Demo"],
        security: [{ bearerAuth: [] }],
      },
      preHandler: [
        (req, res) => requireGatewayAccessToken(env, req, res),
        requireAdminRole,
      ],
    },
    async (_req, reply) => {
      return reply.send({
        success: true,
        message: "You have accessed the admin-only zone successfully!",
      });
    },
  );

  // Boilerplate endpoints (un-schema'd for brevity, but they will show in Swagger without schemas momentarily)
  app.post("/v1/auth/oauth/google", controller.postAuthOauthGoogle);
  app.post("/v1/auth/oauth/apple", controller.postAuthOauthApple);
  app.post("/v1/auth/verify-email", controller.postAuthVerifyEmail);
  app.post("/v1/auth/forgot-password", controller.postAuthForgotPassword);
  app.post("/v1/auth/reset-password", controller.postAuthResetPassword);
  app.post("/v1/auth/2fa/setup", controller.postAuth2FaSetup);
  app.post("/v1/auth/2fa/verify", controller.postAuth2FaVerify);
  app.post("/v1/auth/2fa/disable", controller.postAuth2FaDisable);
  app.post("/v1/auth/device-token", controller.postAuthDeviceToken);
  app.delete("/v1/auth/device-token", controller.deleteAuthDeviceToken);

  // Custom split routes
  await authRoutes(fastifyApp, env);
  await healthRoutes(fastifyApp, env);
}
