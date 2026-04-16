import { FastifyInstance } from "fastify";
import type { Env } from "../config/env.js";
import { cardsRoutes } from "./cards.routes.js";
import { healthRoutes } from "./health.routes.js";

export async function registerRoutes(app: FastifyInstance, env: Env) {
  // Decorate fastify instance with env so controllers can access it
  app.decorate("env", env);

  // Add hook to attach env to each request
  app.addHook("onRequest", async (request) => {
    (request as any).env = env;
  });

  // Card-DB routes with /v1/cards prefix
  await app.register(cardsRoutes, { prefix: "/v1/cards" });

  // Health routes
  await app.register(healthRoutes, { prefix: "/health" });
}
