import fastifyHttpProxy from "@fastify/http-proxy";
import type { FastifyInstance } from "fastify";
import type { Env } from "../config/env.js";
import { GATEWAY_ROUTES, serviceOrigins } from "../config/gateway-upstreams.js";
import { requireGatewayAccessToken } from "../middleware/gateway-jwt.js";

/**
 * ============================================================================
 * THE API GATEWAY PROXY CORE
 * ============================================================================
 * Because RSL Cards operates isolated microservices, the Mobile App cannot
 * talk to the database services directly. Everything comes through this single file.
 *
 * This file intercepts ALL generic requests (like `/transactions/` or `/cards/`),
 * strips the User's JWT Token, rigorously validates it, and then structurally routes
 * that Request directly to the correct isolated Microservice running on Port 3000.
 */
export async function registerGatewayProxy(
  app: FastifyInstance,
  env: Env,
): Promise<void> {
  // 1. Feature Flag: Can be explicitly disabled for local testing environments
  if (process.env.AUTH_GATEWAY_ENABLED === "false") {
    return;
  }

  // 2. Fetch all known Docker & Localhost origin mappings from config (e.g. `http://inventory-service:3000`)
  const origins = serviceOrigins(env);

  // 3. Loop over every declared Gateway Route prefix (e.g. `/v1/transactions`)
  for (const { prefix, upstreamKey } of GATEWAY_ROUTES) {
    const upstream = origins[upstreamKey];

    await app.register(async (scope) => {
      // ------------------------------------------------------------------------
      // INTERCEPTOR (MIDDLEWARE)
      // Runs identically before ANY proxy request starts
      // ------------------------------------------------------------------------
      scope.addHook("preHandler", async (req, reply) => {
        // We explicitly skip locking down Public Health endpoints
        // to prevent false positives in network heartbeats.
        if (
          req.url === "/users/status" ||
          req.url === "/health" ||
          req.url === "/health/fleet"
        ) {
          return;
        }

        // Extremely rigorous JWT decoding. Rejects the request strictly with an HTTP 401
        // if the client token is structurally expired or cryptographically forged.
        await requireGatewayAccessToken(env, req, reply);

        // Stamp x-user-id on the raw Node IncomingMessage so the proxy forwards it.
        // rewriteRequestHeaders receives IncomingMessage (not FastifyRequest) so
        // gatewayJwt is not accessible there — we must set it here instead.
        const userId = (req as any).gatewayJwt?.userId;
        if (userId) {
          (req.raw as any).headers["x-user-id"] = userId;
        }
        // Inject service key so downstream services with internalAuthPreHandler accept the request
        (req.raw as any).headers["x-service-key"] = env.INTERNAL_SERVICE_KEY;
      });

      // ------------------------------------------------------------------------
      // UPSTREAM PROXY ROUTING
      // ------------------------------------------------------------------------
      await scope.register(fastifyHttpProxy, {
        upstream,
        prefix,
        rewritePrefix: prefix,
        http2: false,
      });
    });
  }
}
