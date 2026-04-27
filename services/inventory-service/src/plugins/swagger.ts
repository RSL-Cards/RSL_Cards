import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export const swaggerPlugin = fp(async (app: FastifyInstance) => {
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Inventory Service API",
        description: "RSL Cards — Dealer card inventory management, bulk import, revaluation, and aging alerts",
        version: "1.0.0",
      },
      servers: [{ url: "http://localhost:3003", description: "Local (direct)" }, { url: "http://localhost:80/v1", description: "Via Nginx + Auth Gateway" }],
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list", deepLinking: true },
  });
});
