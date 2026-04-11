import Fastify from "fastify";
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import type { Env } from "./config/env.js";
import { getRedis } from "./config/redis.js";
import { registerErrorHandler } from "./middleware/error-handler.js";
import { corsPlugin } from "./plugins/cors.js";
import { helmetPlugin } from "./plugins/helmet.js";
import { rateLimitPlugin } from "./plugins/rate-limit.js";
import { requestIdPlugin } from "./plugins/request-id.js";
import { swaggerPlugin } from "./plugins/swagger.js";
import { registerRoutes } from "./routes/index.js";

export async function createApp(env: Env) {
  const redactList = ['body.password', 'responseData.tokens.accessToken', 'responseData.tokens.refreshToken', 'responseData.token', 'body.refreshToken'];
  const logger: any =
    env.NODE_ENV === "development" || env.NODE_ENV === "dev"
      ? {
          level: env.LOG_LEVEL,
          redact: redactList,
          transport: {
            target: "pino-pretty",
            options: { colorize: true },
          },
        }
      : { 
          level: env.LOG_LEVEL,
          redact: redactList
        };

  const app = Fastify({ logger }).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  registerErrorHandler(app);
  await app.register(requestIdPlugin);
  await app.register(helmetPlugin);
  await app.register(corsPlugin, { env });
  await app.register(rateLimitPlugin, { redis: getRedis(env) });
  await app.register(swaggerPlugin);
  
  // Custom Logging Hooks
  app.addHook('preHandler', (req, reply, done) => {
    if (req.body) {
      req.log.info({ body: req.body }, 'parsed request body');
    }
    done();
  });

  app.addHook('onSend', (req, reply, payload, done) => {
    if (payload && typeof payload === 'string' && reply.getHeader('content-type')?.toString().includes('application/json')) {
      try {
        req.log.info({ responseData: JSON.parse(payload) }, 'response payload');
      } catch (e) {}
    }
    done(null, payload);
  });

  await registerRoutes(app, env);
  return app;
}
