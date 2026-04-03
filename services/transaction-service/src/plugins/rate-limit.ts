import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance } from "fastify";
import type { Redis } from "ioredis";

export const rateLimitPlugin = fp(
  async (app: FastifyInstance, opts: { redis: Redis }) => {
    await app.register(rateLimit, {
      max: 100,
      timeWindow: "1 minute",
      redis: opts.redis,
    });
  },
);
