import type { Queue, Worker } from "bullmq";
import { Redis as IORedis } from "ioredis";
import type { FastifyBaseLogger } from "fastify";
import { createDeactivationQueueAndWorker } from "../jobs/deactivation.job.js";
import type { Env } from "./env.js";

let connection: IORedis | null = null;
let deactivationQueue: Queue | null = null;
let deactivationWorker: Worker | null = null;

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
  const created = createDeactivationQueueAndWorker(conn, logger);
  deactivationQueue = created.deactivationQueue;
  deactivationWorker = created.deactivationWorker;
}

export { deactivationQueue };

export async function closeQueue(): Promise<void> {
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
