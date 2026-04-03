import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Env } from "../config/env.js";
import { internalAuthPreHandler } from "../middleware/internal-auth.js";
import { healthRoutes } from "./health.routes.js";
import { narrativesRoutes } from "./narratives.routes.js";

export async function registerRoutes(app: FastifyInstance, env: Env): Promise<void> {
  await healthRoutes(app, env);
  await app.register(
    async (f) => {
      await narrativesRoutes(f, env);
    },
    { prefix: "/narratives" },
  );
  await app.register(
    async (f) => {
      f.get("/probe", async () => ({ ok: true, service: "ai-narrative-service-internal" }));
    },
    {
      prefix: "/internal",
      preHandler: (req: FastifyRequest, reply: FastifyReply) => internalAuthPreHandler(env, req, reply),
    },
  );
}
