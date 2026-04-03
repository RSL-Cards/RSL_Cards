import { Queue, Worker } from "bullmq";
import type { Redis as IORedis } from "ioredis";
import type { FastifyBaseLogger } from "fastify";

export function createAgingQueueAndWorker(
  connection: IORedis,
  logger: FastifyBaseLogger,
): { agingQueue: Queue; agingWorker: Worker } {
  const agingQueue = new Queue("inventory-aging", { connection });
  const agingWorker = new Worker(
    "inventory-aging",
    async (job) => {
      logger.info("Processing aging alert job " + job.id);
      return { processed: true };
    },
    { connection },
  );
  agingWorker.on("error", (err) => {
    logger.error({ err }, "Inventory aging worker error");
  });
  logger.info("Inventory aging worker started and listening");
  return { agingQueue, agingWorker };
}
