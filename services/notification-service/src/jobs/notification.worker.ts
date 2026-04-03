import { Queue, Worker } from "bullmq";
import type { Redis as IORedis } from "ioredis";
import type { FastifyBaseLogger } from "fastify";

type JobData = { type: string; payload?: Record<string, unknown> };

export function startNotificationWorker(
  connection: IORedis,
  logger: FastifyBaseLogger,
): { notificationQueue: Queue; notificationWorker: Worker } {
  const notificationQueue = new Queue("notifications", { connection });
  const notificationWorker = new Worker<JobData>(
    "notifications",
    async (job) => {
      const p = job.opts.priority ?? 0;
      const t = job.data.type;
      if (p === 1 || t === "sale" || t === "sold_alert") {
        logger.info("CRITICAL notification: " + t);
      } else if (p === 2 || t === "price_alert" || t === "narrative") {
        logger.info("STANDARD notification: " + t);
      } else {
        logger.info("DIGEST notification: " + t);
      }
    },
    { connection, concurrency: 3 },
  );
  notificationWorker.on("error", (err) => logger.error({ err }, "notification worker error"));
  return { notificationQueue, notificationWorker };
}
