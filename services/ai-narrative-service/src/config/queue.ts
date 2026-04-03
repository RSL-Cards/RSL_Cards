import type { Queue, Worker } from "bullmq";
import { Redis as IORedis } from "ioredis";
import type { FastifyBaseLogger } from "fastify";
import { startNarrativeIngestionCron } from "../jobs/ingestion.cron.js";
import type { Env } from "./env.js";

let connection: IORedis | null = null;
let narrativeQueue: Queue | null = null;
let narrativeWorker: Worker | null = null;

export function getNarrativeConnection(env: Env): IORedis {
  if (!connection) {
    connection = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      ...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
    });
  }
  return connection;
}

export async function startNarrativeJobs(env: Env, logger: FastifyBaseLogger): Promise<void> {
  const conn = getNarrativeConnection(env);
  const created = await startNarrativeIngestionCron(conn, logger);
  narrativeQueue = created.narrativeQueue;
  narrativeWorker = created.narrativeWorker;
}

export function getNarrativeQueue(): Queue | null {
  return narrativeQueue;
}

export async function closeQueue(): Promise<void> {
  if (narrativeWorker) {
    await narrativeWorker.close();
    narrativeWorker = null;
  }
  if (narrativeQueue) {
    await narrativeQueue.close();
    narrativeQueue = null;
  }
  if (connection) {
    await connection.quit();
    connection = null;
  }
}
