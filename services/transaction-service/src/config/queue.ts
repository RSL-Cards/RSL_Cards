import { Queue } from "bullmq";
import { Redis as IORedis } from "ioredis";
import type { Env } from "./env.js";

let transactionQueue: Queue | null = null;
let connection: IORedis | null = null;

function getConnection(env: Env): IORedis {
  if (!connection) {
    connection = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      ...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
    });
  }
  return connection;
}

export function getTransactionQueue(env: Env): Queue {
  if (!transactionQueue) {
    transactionQueue = new Queue("transaction-deactivate", { connection: getConnection(env) });
  }
  return transactionQueue;
}

export { transactionQueue };

export async function closeQueue(): Promise<void> {
  if (transactionQueue) {
    await transactionQueue.close();
    transactionQueue = null;
  }
  if (connection) {
    await connection.quit();
    connection = null;
  }
}
