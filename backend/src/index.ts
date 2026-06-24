import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { env } from "./config/index.js";
import { logger } from "./lib/logger.js";
import { testDbConnection } from "./db/index.js";
import { redisAdapter } from "./adapters/redis.adapter.js";
import { bullMqAdapter } from "./adapters/bullmq.adapter.js";
import { initWorker } from "./worker.js";
import { authModule } from "./modules/auth/index.js";
import { userModule } from "./modules/user/index.js";
import { inventoryModule } from "./modules/inventory/index.js";
import { transactionModule } from "./modules/transaction/index.js";
import { cardDbModule } from "./modules/card-db/index.js";
import { aiNarrativeModule } from "./modules/ai-narrative/index.js";
import { notificationModule } from "./modules/notification/index.js";
import { analyticsModule } from "./modules/analytics/index.js";
import { adminModule } from "./modules/admin/index.js";
import { listingModule } from "./modules/listing/index.js";
import { assistantModule } from "./modules/assistant/index.js";
import { contactModule } from "./modules/contact/index.js";

import { verifyToken } from "./lib/jwt.js";
import { errorMiddleware } from "./errors/error.middleware.js";

const app = new Elysia()
  .use(cors())
  .use(swagger())
  .use(errorMiddleware)
  // Advanced HTTP Request & Response Logging Middleware
  .onRequest((ctx: any) => {
    (ctx as any).requestStartTime = Date.now();
  })
  .onAfterResponse((ctx: any) => {
    const startTime = (ctx as any).requestStartTime || Date.now();
    const duration = Date.now() - startTime;
    const status = ctx.set.status || 200;
    
    let urlPath = "";
    try {
      const url = new URL(ctx.request.url);
      urlPath = `${url.pathname}${url.search}`;
    } catch {
      urlPath = ctx.request.url;
    }
    
    // Log API transaction with high visibility
    logger.info(`[HTTP] ${ctx.request.method} ${urlPath} - ${status} (${duration}ms)`);
  })
  .onBeforeHandle((ctx: any) => {
    const request = ctx.request;
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.slice(7);
        const payload = verifyToken(token, env);
        if (payload && payload.userId) {
          const userId = payload.userId;
          const userRole = payload.role || "guest";
          const originalGet = request.headers.get.bind(request.headers);
          (request.headers as any).get = (name: string) => {
            const lower = name.toLowerCase();
            if (lower === "x-user-id") return userId;
            if (lower === "x-user-role") return userRole;
            if (lower === "x-service-key") return env.INTERNAL_SERVICE_KEY || "internal_key";
            return originalGet(name);
          };
        }
      } catch (err) {
        logger.debug(`Token verification failed: ${(err as Error).message}`);
      }
    }
  })
  .use(authModule)
  .use(userModule)
  .use(inventoryModule)
  .use(transactionModule)
  .use(cardDbModule)
  .use(aiNarrativeModule)
  .use(notificationModule)
  .use(analyticsModule)
  .use(adminModule)
  .use(listingModule)
  .use(assistantModule)
  // Handle root-level eBay callback (from eBay developer portal RuName)
  .get("/ebay/callback", ({ request }: any) => {
    const url = new URL(request.url);
    return Response.redirect(`/v1/users/ebay/callback${url.search}`, 302);
  })
  .use(contactModule)
  // Highly comprehensive Health Check Endpoint mapping DB, Redis, BullMQ, and backend systems
  .get("/health", async (ctx: any) => {
    const dbStatus = await testDbConnection();
    const redisStatus = await redisAdapter.checkHealth();
    const bullMqStatus = await bullMqAdapter.checkHealth();

    const isHealthy = dbStatus.ok && redisStatus.status === "healthy" && bullMqStatus.status === "healthy";
    
    ctx.set.status = isHealthy ? 200 : 500;

    return {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      service: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        bunVersion: Bun.version,
        platform: process.platform,
      },
      database: {
        status: dbStatus.ok ? "healthy" : "unhealthy",
        error: dbStatus.ok ? undefined : "Database connection failed",
      },
      redis: redisStatus,
      bullmq: bullMqStatus,
    };
  })
  .listen({
    port: env.PORT || 8080,
    hostname: "0.0.0.0"
  });

// Start background worker and scheduled jobs
initWorker();
bullMqAdapter.startCronJobs().catch(err => logger.error(`Cron init failed: ${err}`));

logger.info(`🚀 Backend Monorepo running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
