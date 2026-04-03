import { createHash, timingSafeEqual } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Env } from "../config/env.js";

function hashKey(s: string): Buffer {
  return createHash("sha256").update(s).digest();
}

export function verifyServiceKey(env: Env, headerVal: string | undefined): boolean {
  if (!headerVal) return false;
  const a = hashKey(headerVal);
  const b = hashKey(env.INTERNAL_SERVICE_KEY);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function internalAuthPreHandler(
  env: Env,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const key = request.headers["x-service-key"] as string | undefined;
  if (!verifyServiceKey(env, key)) {
    return reply.status(401).send({
      error: "Unauthorized",
      message: "Invalid service key",
    });
  }
}
