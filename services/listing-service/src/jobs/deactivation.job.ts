import { Queue, Worker } from "bullmq";
import type { Redis as IORedis } from "ioredis";
import type { FastifyBaseLogger } from "fastify";

export function createDeactivationQueueAndWorker(
  connection: IORedis,
  logger: FastifyBaseLogger,
): { deactivationQueue: Queue; deactivationWorker: Worker } {
  const deactivationQueue = new Queue("deactivate-listings", { connection });
  const deactivationWorker = new Worker(
    "deactivate-listings",
    async (job) => {
      const inventoryId = (job.data as { inventoryId?: string }).inventoryId ?? "unknown";
      logger.info("Deactivation job received for inventory: " + inventoryId);
      return { ok: true };
    },
    { connection, concurrency: 5 },
  );
  deactivationWorker.on("error", (err) => logger.error({ err }, "deactivation worker error"));
  logger.info("Cross-platform deactivation worker started");
  return { deactivationQueue, deactivationWorker };
}
