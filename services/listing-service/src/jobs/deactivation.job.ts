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
      const inventoryId =
        (job.data as { inventoryId?: string }).inventoryId ?? "unknown";
      logger.info("Deactivation job received for inventory: " + inventoryId);
      return { ok: true };
    },
    { connection, concurrency: 5 },
  );
  deactivationWorker.on("error", (err) =>
    logger.error({ err }, "deactivation-worker error"),
  );
  deactivationWorker.on("completed", (job) =>
    logger.info({ jobId: job.id }, "deactivation-worker job completed"),
  );
  deactivationWorker.on("failed", (job, err) =>
    logger.error({ jobId: job?.id, err }, "deactivation-worker job failed"),
  );
  deactivationWorker.on("stalled", (jobId) =>
    logger.warn({ jobId }, "deactivation-worker job stalled"),
  );
  logger.info("deactivation-worker started");
  return { deactivationQueue, deactivationWorker };
}
