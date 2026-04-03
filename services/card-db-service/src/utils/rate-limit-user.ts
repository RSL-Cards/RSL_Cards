import type { FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

/** Prefer JWT `sub` for per-user buckets; fall back to client IP. */
export function rateLimitUserKey(request: FastifyRequest): string {
  const h = request.headers.authorization;
  if (typeof h === "string" && h.startsWith("Bearer ")) {
    try {
      const token = h.slice("Bearer ".length).trim();
      const decoded = jwt.decode(token);
      if (decoded && typeof decoded === "object" && decoded !== null && "sub" in decoded) {
        const sub = (decoded as { sub?: unknown }).sub;
        if (sub != null && sub !== "") return String(sub);
      }
    } catch {
      /* invalid token — use ip */
    }
  }
  return request.ip;
}
