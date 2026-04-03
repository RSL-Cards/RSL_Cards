import jwt from "jsonwebtoken";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Env } from "../config/env.js";

function useHs256Fallback(env: Env): boolean {
  return (
    env.JWT_PUBLIC_KEY.includes("REPLACE") ||
    env.JWT_PRIVATE_KEY.includes("REPLACE") ||
    env.JWT_PUBLIC_KEY.length < 50
  );
}

export async function adminAuthPreHandler(
  env: Env,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const hdr = request.headers.authorization;
  if (!hdr?.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Unauthorized", message: "Token required" });
  }
  const token = hdr.slice("Bearer ".length).trim();
  try {
    const payload = useHs256Fallback(env)
      ? (jwt.verify(token, "temp-dev-secret", { algorithms: ["HS256"] }) as jwt.JwtPayload)
      : (jwt.verify(token, env.JWT_PUBLIC_KEY, { algorithms: ["RS256"] }) as jwt.JwtPayload);
    if (payload.role !== "admin") {
      return reply.status(403).send({ error: "Forbidden", message: "Admin role required" });
    }
  } catch {
    return reply.status(401).send({ error: "Unauthorized", message: "Invalid token" });
  }
}
