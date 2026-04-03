import type { Queue, Worker } from "bullmq";
import { Redis as IORedis } from "ioredis";
import type { FastifyBaseLogger } from "fastify";
import { startDailySnapshotCron } from "../jobs/daily-snapshot.cron.js";
import type { Env } from "./env.js";

let connection: IORedis | null = null;
let snapshotQueue: Queue | null = null;
let snapshotWorker: Worker | null = null;

export function getAnalyticsQueueConnection(env: Env): IORedis {
  if (!connection) {
    connection = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      ...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
    });
  }
  return connection;
}

export async function startAnalyticsJobs(env: Env, logger: FastifyBaseLogger): Promise<void> {
  const conn = getAnalyticsQueueConnection(env);
  const created = await startDailySnapshotCron(conn, logger);
  snapshotQueue = created.snapshotQueue;
  snapshotWorker = created.snapshotWorker;
}

export function getSnapshotQueue(): Queue | null {
  return snapshotQueue;
}

export async function closeQueue(): Promise<void> {
  if (snapshotWorker) {
    await snapshotWorker.close();
    snapshotWorker = null;
  }
  if (snapshotQueue) {
    await snapshotQueue.close();
    snapshotQueue = null;
  }
  if (connection) {
    await connection.quit();
    connection = null;
  }
}
