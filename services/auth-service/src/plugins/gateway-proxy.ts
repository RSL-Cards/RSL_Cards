import fastifyHttpProxy from "@fastify/http-proxy";
import type { FastifyInstance } from "fastify";
import type { Env } from "../config/env.js";
import { GATEWAY_ROUTES, serviceOrigins } from "../config/gateway-upstreams.js";
import { requireGatewayAccessToken } from "../middleware/gateway-jwt.js";

/**
 * Reverse-proxy domain APIs through auth-service after JWT validation (Kong-style edge).
 */
export async function registerGatewayProxy(
  app: FastifyInstance,
  env: Env,
): Promise<void> {
  if (process.env.AUTH_GATEWAY_ENABLED === "false") {
    return;
  }
  const origins = serviceOrigins(env);
  for (const { prefix, upstreamKey } of GATEWAY_ROUTES) {
    const upstream = origins[upstreamKey];
    await app.register(async (scope) => {
      scope.addHook("preHandler", async (req, reply) => {
        // Skip JWT validation for public health check routes
        if (req.url === "/users/status") {
          return;
        }
        return requireGatewayAccessToken(env, req, reply);
      });
      await scope.register(fastifyHttpProxy, {
        upstream,
        prefix,
        http2: false,
        replyOptions: {
          rewriteRequestHeaders: (originalReq, headers) => {
            // Add x-user-id header from JWT payload for downstream services
            const jwtPayload = (originalReq as any).gatewayJwt;
            if (jwtPayload?.sub) {
              return {
                ...headers,
                "x-user-id": jwtPayload.sub,
              };
            }
            return headers;
          },
        },
      });
    });
  }
}
