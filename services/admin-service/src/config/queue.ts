import { Queue } from "bullmq";
import { Redis as IORedis } from "ioredis";
import type { Env } from "./env.js";

let queue: Queue | null = null;
let connection: IORedis | null = null;

export function getQueueConnection(env: Env): IORedis {
  if (!connection) {
    connection = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      ...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
    });
  }
  return connection;
}

export function getAuthQueue(env: Env): Queue {
  if (!queue) {
    queue = new Queue("auth-default", { connection: getQueueConnection(env) });
  }
  return queue;
}

export async function closeQueue(): Promise<void> {
  if (queue) {
    await queue.close();
    queue = null;
  }
  if (connection) {
    await connection.quit();
    connection = null;
  }
}
