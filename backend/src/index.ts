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
import { webDashboardModule } from "./modules/web-dashboard/index.js";
import { batchRouter } from "./modules/batch/index.js";
import { showcaseModule } from "./modules/showcase/index.js";
import { dailyLogsModule } from "./modules/daily-logs/index.js";

import { verifyToken } from "./lib/jwt.js";
import { errorMiddleware } from "./errors/error.middleware.js";
import { promMetrics, getPrometheusOutput } from "./lib/metrics.js";

function getApiTaskName(method: string, path: string) {
  if (path.includes("/v1/transactions/buy")) return "Record Buy Transaction";
  if (path.includes("/v1/transactions/sell")) return "Record Sell Transaction";
  if (path.includes("/v1/inventory/summary")) return "Fetch Inventory Summary";
  if (path.includes("/v1/inventory") && method === "GET") return "Fetch Inventory List";
  if (path.includes("/v1/inventory") && method === "POST") return "Add to Inventory";
  if (path.includes("/v1/analytics/daily")) return "Fetch Daily Analytics";
  if (path.includes("/v1/analytics/today-activity")) return "Fetch Today's Activity";
  if (path.includes("/v1/analytics/dashboard")) return "Fetch Dashboard Data";
  if (path.includes("/v1/cards/scan/barcode")) return "Scan Barcode";
  if (path.includes("/v1/narratives/scan-card")) return "AI Card Scan";
  if (path.includes("/v1/auth/login")) return "User Login";
  
  const segments = path.split("/").filter(Boolean);
  const resource = segments[1] || "unknown";
  return `${method} ${resource.toUpperCase()}`;
}

const app = new Elysia()
  // @ts-ignore
  .use(cors())
  // @ts-ignore
  .use(swagger())
  .use(errorMiddleware)
  // Advanced HTTP Request & Response Observability & Trace Logging Middleware
  .onRequest((ctx: any) => {
    const startTime = Date.now();
    const startCpu = process.cpuUsage();
    const traceId = `tr_${startTime.toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    (ctx as any).requestStartTime = startTime;
    (ctx as any).requestStartCpu = startCpu;
    (ctx as any).traceId = traceId;

    let urlPath = "";
    try {
      const url = new URL(ctx.request.url);
      urlPath = `${url.pathname}${url.search}`;
    } catch {
      urlPath = ctx.request.url;
    }
    (ctx as any).urlPath = urlPath;

    if (!urlPath.startsWith("/health") && !urlPath.startsWith("/metrics")) {
      const pathOnly = urlPath.split("?")[0];
      const taskName = getApiTaskName(ctx.request.method, pathOnly);
      logger.info(`[TRACE ${traceId}] ──► START [${taskName}] ${ctx.request.method} ${urlPath}`);
    }
  })
  .onAfterResponse((ctx: any) => {
    const startTime = (ctx as any).requestStartTime || Date.now();
    const traceId = (ctx as any).traceId || "no_trace";
    const duration = Date.now() - startTime;
    const status = ctx.set.status || 200;
    const urlPath = (ctx as any).urlPath || ctx.request.url;

    // Record Prometheus Metrics
    promMetrics.totalRequests++;
    promMetrics.statusCodes[status] = (promMetrics.statusCodes[status] || 0) + 1;
    promMetrics.requestDurations.push(duration);
    if (promMetrics.requestDurations.length > 2000) promMetrics.requestDurations.shift();

    if (ctx.set && ctx.set.headers) {
      ctx.set.headers["X-Trace-Id"] = traceId;
    }

    if (!urlPath.startsWith("/health") && !urlPath.startsWith("/metrics")) {
      const userId = ctx.request.headers.get("x-user-id") || "guest";
      
      let reqStr = "";
      if (ctx.request.method !== "GET" && ctx.body) {
        try {
          const b = JSON.stringify(ctx.body);
          reqStr = b.length > 300 ? ` | Req: ${b.substring(0, 300)}...` : ` | Req: ${b}`;
        } catch (e) {}
      }
      
      let resStr = "";
      if (ctx.response) {
        try {
          const r = JSON.stringify(ctx.response);
          resStr = r.length > 300 ? ` | Res: ${r.substring(0, 300)}...` : ` | Res: ${r}`;
        } catch (e) {}
      }

      logger.info(`[TRACE ${traceId}] ◄── END ${ctx.request.method} ${urlPath} - ${status} (${duration}ms) | User: ${userId}${reqStr}${resStr}`);
    }
  })
  .use(showcaseModule)
  .onBeforeHandle((ctx: any) => {
    const request = ctx.request;
    const authHeader = request.headers.get("authorization");
    const traceId = (ctx as any).traceId || "no_trace";
    const urlPath = (ctx as any).urlPath || request.url;
    const startTime = (ctx as any).requestStartTime || Date.now();

    let token = "";
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else {
      try {
        const url = new URL(request.url);
        token = url.searchParams.get("token") || "";
      } catch (e) {}
    }

    if (token) {
      try {
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
          if (!urlPath.startsWith("/health") && !urlPath.startsWith("/metrics")) {
            logger.info(`[TRACE ${traceId}] ├── AUTH OK (User: ${userId}, Role: ${userRole}) [${Date.now() - startTime}ms]`);
          }
        }
      } catch (err) {
        logger.debug(`[TRACE ${traceId}] ├── AUTH FAILED: ${(err as Error).message}`);
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
  .get("/", () => ({ status: "ok", service: "RSL Cards API", version: "1.0.0" }))
  .get("/favicon.ico", ({ set }) => {
    set.status = 204;
    return "";
  })
  .use(contactModule)
  .use(webDashboardModule)
  .use(batchRouter)
  .use(dailyLogsModule)
  // Prometheus Metrics Scrape Endpoint
  .get("/metrics", () => {
    return new Response(getPrometheusOutput(), {
      headers: { "Content-Type": "text/plain; version=0.0.4" },
    });
  })
  // Highly comprehensive Health Check Endpoint mapping DB, Redis, BullMQ, and backend systems
  .get("/health", async (ctx: any) => {
    let dbStatus = { ok: false };
    let redisStatus: any = { status: "unhealthy" };
    let bullMqStatus: any = { status: "unhealthy" };

    try { dbStatus = await testDbConnection(); } catch (e) {}
    try { redisStatus = await redisAdapter.checkHealth(); } catch (e) {}
    try { bullMqStatus = await bullMqAdapter.checkHealth(); } catch (e) {}

    const isHealthy = dbStatus.ok && redisStatus.status === "healthy" && bullMqStatus.status === "healthy";
    
    ctx.set.status = 200; // Return 200 OK for container liveness check

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
