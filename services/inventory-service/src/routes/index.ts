import { FastifyInstance } from "fastify";
import type { Env } from "../config/env.js";
import { inventoryRoutes } from "./inventory.routes.js";
import { healthRoutes } from "./health.routes.js";

export async function registerRoutes(app: FastifyInstance, env: Env) {
  // Decorate fastify instance with env so controllers can access it
  app.decorate("env", env);

  // Add hook to attach env to each request
  app.addHook("onRequest", async (request) => {
    (request as any).env = env;
  });

  // Health routes
  await app.register(healthRoutes, { prefix: "/health" });

  // Inventory routes with /v1/inventory prefix
  await app.register(inventoryRoutes, { prefix: "/v1/inventory" });
}
