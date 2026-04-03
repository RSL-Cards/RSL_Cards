import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Env } from "../config/env.js";
import { internalAuthPreHandler } from "../middleware/internal-auth.js";
import { adminRoutes } from "./admin.routes.js";
import { healthRoutes } from "./health.routes.js";

export async function registerRoutes(app: FastifyInstance, env: Env): Promise<void> {
  await healthRoutes(app, env);
  await app.register(
    async (f) => {
      await adminRoutes(f, env);
    },
    { prefix: "/admin" },
  );
  await app.register(
    async (f) => {
      f.get("/probe", async () => ({ ok: true, service: "admin-service-internal" }));
    },
    {
      prefix: "/internal",
      preHandler: (req: FastifyRequest, reply: FastifyReply) => internalAuthPreHandler(env, req, reply),
    },
  );
}
