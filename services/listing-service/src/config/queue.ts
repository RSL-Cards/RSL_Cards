import type { Queue, Worker } from "bullmq";
import { Redis as IORedis } from "ioredis";
import type { FastifyBaseLogger } from "fastify";
import { createDeactivationQueueAndWorker } from "../jobs/deactivation.job.js";
import { createPriceRefreshQueue } from "../jobs/price-refresh.job.js";
import type { Env } from "./env.js";

let connection: IORedis | null = null;
let deactivationQueue: Queue | null = null;
let deactivationWorker: Worker | null = null;
let priceRefreshQueue: Queue | null = null;
let priceRefreshWorker: Worker | null = null;

export function getListingQueueConnection(env: Env): IORedis {
  if (!connection) {
    connection = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      ...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
    });
  }
  return connection;
}

export function startListingWorkers(env: Env, logger: FastifyBaseLogger): void {
  const conn = getListingQueueConnection(env);

  const deact = createDeactivationQueueAndWorker(conn, logger);
  deactivationQueue = deact.deactivationQueue;
  deactivationWorker = deact.deactivationWorker;

  const priceRefresh = createPriceRefreshQueue(conn, env, logger);
  priceRefreshQueue = priceRefresh.priceRefreshQueue;
  priceRefreshWorker = priceRefresh.priceRefreshWorker;

  // Log queue status after startup
  void logQueueStatus(logger);
}

async function logQueueStatus(logger: FastifyBaseLogger): Promise<void> {
  try {
    const [dCounts, pCounts] = await Promise.all([
      deactivationQueue
        ? deactivationQueue.getJobCounts(
            "waiting",
            "active",
            "delayed",
            "failed",
            "completed",
          )
        : null,
      priceRefreshQueue
        ? priceRefreshQueue.getJobCounts(
            "waiting",
            "active",
            "delayed",
            "failed",
            "completed",
          )
        : null,
    ]);
    logger.info(
      { "deactivate-listings": dCounts, "price-refresh": pCounts },
      "BullMQ queue status on startup",
    );
  } catch (err) {
    logger.warn({ err }, "Could not fetch BullMQ queue status");
  }
}

export { deactivationQueue, priceRefreshQueue };

export async function closeQueue(): Promise<void> {
  if (priceRefreshWorker) {
    await priceRefreshWorker.close();
    priceRefreshWorker = null;
  }
  if (priceRefreshQueue) {
    await priceRefreshQueue.close();
    priceRefreshQueue = null;
  }
  if (deactivationWorker) {
    await deactivationWorker.close();
    deactivationWorker = null;
  }
  if (deactivationQueue) {
    await deactivationQueue.close();
    deactivationQueue = null;
  }
  if (connection) {
    await connection.quit();
    connection = null;
  }
}
