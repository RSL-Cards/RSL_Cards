import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";

export const requestIdPlugin = fp(async (app: FastifyInstance) => {
  app.addHook("onRequest", async (req, reply) => {
    const id =
      typeof req.headers["x-request-id"] === "string"
        ? req.headers["x-request-id"]
        : randomUUID();
    reply.header("X-Request-Id", id);
  });
});
