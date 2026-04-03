import type { Queue, Worker } from "bullmq";
import { Redis as IORedis } from "ioredis";
import type { FastifyBaseLogger } from "fastify";
import { startNotificationWorker } from "../jobs/notification.worker.js";
import type { Env } from "./env.js";

let connection: IORedis | null = null;
let notificationQueue: Queue | null = null;
let notificationWorker: Worker | null = null;

export function getNotificationConnection(env: Env): IORedis {
  if (!connection) {
    connection = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      ...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
    });
  }
  return connection;
}

export function startNotificationJobs(env: Env, logger: FastifyBaseLogger): void {
  const conn = getNotificationConnection(env);
  const created = startNotificationWorker(conn, logger);
  notificationQueue = created.notificationQueue;
  notificationWorker = created.notificationWorker;
}

export async function closeQueue(): Promise<void> {
  if (notificationWorker) {
    await notificationWorker.close();
    notificationWorker = null;
  }
  if (notificationQueue) {
    await notificationQueue.close();
    notificationQueue = null;
  }
  if (connection) {
    await connection.quit();
    connection = null;
  }
}
