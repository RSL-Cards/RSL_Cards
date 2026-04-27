import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export const swaggerPlugin = fp(async (app: FastifyInstance) => {
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Transaction Service API",
        description: "RSL Cards — Buy, sell, and trade transactions with profit and deal-rating calculations",
        version: "1.0.0",
      },
      servers: [{ url: "http://localhost:3004", description: "Local (direct)" }, { url: "http://localhost:80/v1", description: "Via Nginx" }],
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
