import { FastifyInstance } from "fastify";
import type { Env } from "../config/env.js";
import { usersRoutes } from "./users.routes.js";
import { healthRoutes } from "./health.routes.js";

export async function registerRoutes(app: FastifyInstance, env: Env) {
  // Decorate fastify instance with env so controllers can access it
  app.decorate("env", env);

  // Add hook to attach env to each request
  app.addHook("onRequest", async (request) => {
    (request as any).env = env;
  });

  // User routes with /v1/users prefix
  await app.register(usersRoutes, { prefix: "/v1/users" });

  // Health routes
  await app.register(healthRoutes, { prefix: "/health" });
}
