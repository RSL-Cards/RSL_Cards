import type { JwtPayload } from "./index.js";

declare module "fastify" {
  interface FastifyRequest {
    gatewayJwt?: JwtPayload;
  }
}
