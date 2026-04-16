import { FastifyInstance } from "fastify";
import type { Env } from "../config/env.js";
import { listingRoutes } from "./listing.routes.js";
import { healthRoutes } from "./health.routes.js";

export async function registerRoutes(app: FastifyInstance, env: Env) {
  // Decorate fastify instance with env so controllers can access it
  app.decorate("env", env);

  // Add hook to attach env to each request
  app.addHook("onRequest", async (request) => {
    (request as any).env = env;
  });

  // Listing routes with /v1/listings prefix
  await app.register(listingRoutes, { prefix: "/v1/listings" });

  // Health routes
  await app.register(healthRoutes, { prefix: "/health" });
}
