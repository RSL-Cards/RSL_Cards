import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getDb } from "../config/db.js";
import { getRedis } from "../config/redis.js";

const platforms = new Set(["ebay", "whatnot", "mercari", "tcgplayer"]);

export async function listingRoutes(app: FastifyInstance, env: Env): Promise<void> {
  app.get("/ping", async (_request, reply) => {
    let db_connected = false;
    try {
      await getDb(env).execute(sql`SELECT 1`);
      db_connected = true;
    } catch {
      db_connected = false;
    }
    let redis_connected = false;
    try {
      redis_connected = (await getRedis(env).ping()) === "PONG";
    } catch {
      redis_connected = false;
    }
    return reply.send({
      service: "listing-service",
      environment: env.NODE_ENV,
      db_connected,
      redis_connected,
      deactivation_worker: "running",
      timestamp: new Date().toISOString(),
    });
  });

  app.post<{ Params: { platform: string }; Body: Record<string, unknown> }>(
    "/webhook/:platform",
    async (request, reply) => {
      const platform = request.params.platform.toLowerCase();
      if (!platforms.has(platform)) {
        return reply.status(400).send({ error: "unknown platform" });
      }
      request.log.info(
        "Webhook received from " + platform + ": " + JSON.stringify(request.body ?? {}),
      );
      const sig = request.headers["x-signature"] ?? request.headers["x-ebay-signature"];
      request.log.info({ sig }, "webhook signature header (verification stub)");
      return reply.send({ received: true, platform });
    },
  );
}
