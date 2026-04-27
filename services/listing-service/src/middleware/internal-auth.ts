import { createHash, timingSafeEqual } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Env } from "../config/env.js";

function hashKey(s: string): Buffer {
  return createHash("sha256").update(s).digest();
}

export function verifyServiceKey(
  env: Env,
  headerVal: string | undefined,
): boolean {
  if (!headerVal) return false;
  const a = hashKey(headerVal);
  const b = hashKey(env.INTERNAL_SERVICE_KEY);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function internalAuthPreHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  // Requests proxied through auth-service gateway carry x-user-id (set after JWT validation)
  if (request.headers["x-user-id"]) return;

  // Direct service-to-service calls use x-service-key
  const env = (request as any).env as Env;
  const key = request.headers["x-service-key"] as string | undefined;
  if (!verifyServiceKey(env, key)) {
    return reply.status(401).send({
      error: "Unauthorized",
      message: "Invalid service key",
    });
  }
}
