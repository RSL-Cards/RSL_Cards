import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Env } from "../config/env.js";
import { internalAuthPreHandler } from "../middleware/internal-auth.js";
import { healthRoutes } from "./health.routes.js";
import { listingRoutes } from "./listing.routes.js";

export async function registerRoutes(app: FastifyInstance, env: Env): Promise<void> {
  await healthRoutes(app, env);
  await app.register(
    async (f) => {
      await listingRoutes(f, env);
    },
    { prefix: "/listings" },
  );
  await app.register(
    async (f) => {
      f.get("/probe", async () => ({ ok: true, service: "listing-service-internal" }));
    },
    {
      prefix: "/internal",
      preHandler: (req: FastifyRequest, reply: FastifyReply) => internalAuthPreHandler(env, req, reply),
    },
  );
}
