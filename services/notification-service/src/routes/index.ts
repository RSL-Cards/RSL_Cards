import { FastifyInstance } from "fastify";
import type { Env } from "../config/env.js";
import { notificationsRoutes } from "./notifications.routes.js";
import { healthRoutes } from "./health.routes.js";

export async function registerRoutes(app: FastifyInstance, env: Env) {
  // Decorate fastify instance with env so controllers can access it
  app.decorate("env", env);

  // Add hook to attach env to each request
  app.addHook("onRequest", async (request) => {
    (request as any).env = env;
  });

  // Notifications routes with /v1/notifications prefix
  await app.register(notificationsRoutes, { prefix: "/v1/notifications" });

  // Health routes
  await app.register(healthRoutes, { prefix: "/health" });
}
