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
    const payload = verifyToken(env, header.slice(7));
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
