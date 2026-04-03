import Fastify from "fastify";
import type { Env } from "./config/env.js";
import { getRedis } from "./config/redis.js";
import { registerErrorHandler } from "./middleware/error-handler.js";
import { corsPlugin } from "./plugins/cors.js";
import { helmetPlugin } from "./plugins/helmet.js";
import { rateLimitPlugin } from "./plugins/rate-limit.js";
import { requestIdPlugin } from "./plugins/request-id.js";
import { registerRoutes } from "./routes/index.js";

export async function createApp(env: Env) {
  const logger =
    env.NODE_ENV === "development" || env.NODE_ENV === "dev"
      ? {
          level: env.LOG_LEVEL,
          transport: {
            target: "pino-pretty",
            options: { colorize: true },
          },
        }
      : { level: env.LOG_LEVEL };

  const app = Fastify({ logger });

  registerErrorHandler(app);
  await app.register(requestIdPlugin);
  await app.register(helmetPlugin);
  await app.register(corsPlugin, { env });
  await app.register(rateLimitPlugin, { redis: getRedis(env) });
  await registerRoutes(app, env);
  return app;
}
