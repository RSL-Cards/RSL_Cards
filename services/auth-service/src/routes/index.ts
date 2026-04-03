import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Env } from "../config/env.js";
import { internalAuthPreHandler } from "../middleware/internal-auth.js";
import { registerGatewayProxy } from "../plugins/gateway-proxy.js";
import { authRoutes } from "./auth.routes.js";
import { healthRoutes } from "./health.routes.js";

export async function registerRoutes(
  app: FastifyInstance,
  env: Env,
): Promise<void> {
  await healthRoutes(app, env);
  await app.register(
    async (f) => {
      await authRoutes(f, env);
    },
    { prefix: "/auth" },
  );
  await registerGatewayProxy(app, env);
  await app.register(
    async (f) => {
      f.get("/probe", async () => ({
        ok: true,
        service: "auth-service-internal",
      }));
    },
    {
      prefix: "/internal",
      preHandler: (req: FastifyRequest, reply: FastifyReply) =>
        internalAuthPreHandler(env, req, reply),
    },
  );
}
