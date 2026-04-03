import type { Queue, Worker } from "bullmq";
import { Redis as IORedis } from "ioredis";
import type { FastifyBaseLogger } from "fastify";
import { createAgingQueueAndWorker } from "../jobs/aging-alert.job.js";
import type { Env } from "./env.js";

let connection: IORedis | null = null;
let agingQueue: Queue | null = null;
let agingWorker: Worker | null = null;

export function getInventoryQueueConnection(env: Env): IORedis {
  if (!connection) {
    connection = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      ...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
    });
  }
  return connection;
}

export function startInventoryWorkers(env: Env, logger: FastifyBaseLogger): void {
  const conn = getInventoryQueueConnection(env);
  const created = createAgingQueueAndWorker(conn, logger);
  agingQueue = created.agingQueue;
  agingWorker = created.agingWorker;
}

export function getAgingQueue(): Queue | null {
  return agingQueue;
}

export async function closeQueue(): Promise<void> {
  if (agingWorker) {
    await agingWorker.close();
    agingWorker = null;
  }
  if (agingQueue) {
    await agingQueue.close();
    agingQueue = null;
  }
  if (connection) {
    await connection.quit();
    connection = null;
  }
}
