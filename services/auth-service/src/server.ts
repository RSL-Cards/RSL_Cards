import { validateEnv } from "./config/env.js";
import { closeDb, testConnection as testDb } from "./config/db.js";
import { closeQueue } from "./config/queue.js";
import { closeRedis, testConnection as testRedis } from "./config/redis.js";
import { createApp } from "./app.js";

function dbNameFromUrl(url: string): string {
  const base = url.split("?")[0] ?? url;
  const seg = base.split("/").filter(Boolean);
  return seg[seg.length - 1] ?? "postgres";
}

function redisDisplay(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}:${u.port || "6379"}`;
  } catch {
    return url;
  }
}

function printBanner(opts: {
  service: string;
  port: number;
  environment: string;
  dbName: string;
  redis: string;
}): void {
  const top = "nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn";
  const lines = [
    top,
    `n RSL Cards - ${opts.service} n`,
    `n Environment : ${opts.environment} n`,
    `n URL : http://localhost:${opts.port} n`,
    `n Health : http://localhost:${opts.port}/health n`,
    `n PostgreSQL : Connected (${opts.dbName}) n`,
    `n Redis : Connected (${opts.redis}) n`,
    top,
  ];
  // eslint-disable-next-line no-console -- PDF requires startup banner on stdout
  console.log(lines.join("\n"));
}

async function main() {
  const env = validateEnv();
  const port = env.AUTH_SERVICE_PORT;
  const publicRaw = process.env.SERVICE_PUBLIC_PORT;
  const displayPort =
    publicRaw !== undefined && publicRaw !== "" && !Number.isNaN(Number(publicRaw))
      ? Number(publicRaw)
      : port;
  const app = await createApp(env);

  const dbOk = await testDb(env);
  if (!dbOk.ok) {
    app.log.error({ err: dbOk.error }, "PostgreSQL connection failed");
    process.exit(1);
  }
  const redisOk = await testRedis(env);
  if (!redisOk.ok) {
    app.log.error({ err: redisOk.error }, "Redis connection failed");
    process.exit(1);
  }

  await app.listen({ port, host: "0.0.0.0" });

  printBanner({
    service: "auth-service",
    port: displayPort,
    environment: env.NODE_ENV,
    dbName: dbNameFromUrl(env.DATABASE_URL),
    redis: redisDisplay(env.REDIS_URL),
  });

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, "shutdown signal");
    const closePromise = app.close();
    const timeout = new Promise((_, rej) =>
      setTimeout(() => rej(new Error("shutdown timeout")), 10_000),
    );
    try {
      await Promise.race([closePromise, timeout]);
    } catch {
      app.log.warn("Forced shutdown after 10s drain wait");
    }
    await closeDb();
    await closeRedis();
    await closeQueue();
    app.log.info("auth-service shut down gracefully");
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
