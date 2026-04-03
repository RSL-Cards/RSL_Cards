import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Env } from "../config/env.js";
import { internalAuthPreHandler } from "../middleware/internal-auth.js";
import { analyticsRoutes } from "./analytics.routes.js";
import { healthRoutes } from "./health.routes.js";

export async function registerRoutes(app: FastifyInstance, env: Env): Promise<void> {
  await healthRoutes(app, env);
  await app.register(
    async (f) => {
      await analyticsRoutes(f, env);
    },
    { prefix: "/analytics" },
  );
  await app.register(
    async (f) => {
      f.get("/probe", async () => ({ ok: true, service: "analytics-service-internal" }));
    },
    {
      prefix: "/internal",
      preHandler: (req: FastifyRequest, reply: FastifyReply) => internalAuthPreHandler(env, req, reply),
    },
  );
}
