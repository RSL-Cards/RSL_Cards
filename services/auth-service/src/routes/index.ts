import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth.routes.js";
import { healthRoutes } from "./health.routes.js";
import { registerGatewayProxy } from "../plugins/gateway-proxy.js";
import type { Env } from "../config/env.js";

export async function registerRoutes(app: FastifyInstance, env: Env) {
  // Decorate fastify instance with env so controllers can access it
  app.decorate("env", env);

  // Add hook to attach env to each request
  app.addHook("onRequest", async (request) => {
    (request as any).env = env;
  });

  // Auth routes with /v1/auth prefix
  await app.register(authRoutes, { prefix: "/v1/auth" });

  // Health routes
  await app.register(healthRoutes, { prefix: "/health" });

  // Gateway proxy for other microservices
  await registerGatewayProxy(app, env);
}
