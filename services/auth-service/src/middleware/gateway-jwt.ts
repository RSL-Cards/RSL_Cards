import type { FastifyReply, FastifyRequest } from "fastify";
import type { Env } from "../config/env.js";
import { verifyToken } from "../utils/jwt.js";
/**
 * API gateway guard: validates RS256/HS256 access tokens before proxying to domain services.
 * Aligns with the doc model where an edge gateway (Kong) verifies JWT on every request.
 */
export async function requireGatewayAccessToken(
  env: Env,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (request.method === "OPTIONS") {
    return;
  }
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    await reply.status(401).send({
      error: "unauthorized",
      message: "Missing Bearer access token",
    });
    return;
  }
  try {
    const payload = verifyToken(header.slice(7), env);
    if (payload.type !== "access") {
      await reply.status(401).send({
        error: "unauthorized",
        message: "An access token is required for this route",
      });
      return;
    }
    request.gatewayJwt = payload;
  } catch {
    await reply.status(401).send({
      error: "unauthorized",
      message: "Invalid or expired access token",
    });
  }
}

export async function requireAdminRole(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const jwt = (request as any).gatewayJwt;
  if (!jwt || jwt.role !== 'admin') {
    await reply.status(403).send({
      error: "forbidden",
      message: "Admin role required",
    });
    return;
  }
}

export async function requireDealerRole(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const jwt = (request as any).gatewayJwt;
  // dealers and admins are usually allowed to do dealer things
  if (!jwt || (jwt.role !== 'dealer' && jwt.role !== 'admin')) {
    await reply.status(403).send({
      error: "forbidden",
      message: "Dealer role required",
    });
    return;
  }
}

export async function requireConsumerRole(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const jwt = (request as any).gatewayJwt;
  // everyone valid effectively has at least consumer
  if (!jwt || !jwt.role) {
    await reply.status(403).send({
      error: "forbidden",
      message: "Consumer role required",
    });
    return;
  }
}
