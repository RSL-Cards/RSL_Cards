import { z } from 'zod';
import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getDb } from "../config/db.js";
import { getRedis } from "../config/redis.js";

export async function authRoutes(app: FastifyInstance, env: Env): Promise<void> {
  app.post(
    "/ping",
    {
      schema: {
        body: z.object({
          message: z.string()
        }),
      },
    },
    async (request, reply) => {
      const body = request.body as { message: string };
      let db_connected = false;
      try {
        await getDb(env).execute(sql`SELECT 1`);
        db_connected = true;
      } catch {
        db_connected = false;
      }
      let redis_connected = false;
      try {
        const pong = await getRedis(env).ping();
        redis_connected = pong === "PONG";
      } catch {
        redis_connected = false;
      }
      return reply.send({
        service: "auth-service",
        received: body.message,
        environment: env.NODE_ENV,
        db_connected,
        redis_connected,
        timestamp: new Date().toISOString(),
      });
    },
  );
}
