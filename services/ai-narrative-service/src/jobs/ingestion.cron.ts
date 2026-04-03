import { Queue, Worker } from "bullmq";
import type { Redis as IORedis } from "ioredis";
import type { FastifyBaseLogger } from "fastify";

export async function startNarrativeIngestionCron(
  connection: IORedis,
  logger: FastifyBaseLogger,
): Promise<{ narrativeQueue: Queue; narrativeWorker: Worker }> {
  const narrativeQueue = new Queue("narrative-ingestion", { connection });
  const narrativeWorker = new Worker(
    "narrative-ingestion",
    async () => {
      logger.info("Narrative ingestion cron fired at: " + new Date().toISOString());
    },
    { connection },
  );
  narrativeWorker.on("error", (err) => logger.error({ err }, "narrative worker error"));
  await narrativeQueue.add(
    "ingest",
    {},
    {
      repeat: { pattern: "0 */2 * * *" },
      jobId: "narrative-ingestion-repeat",
    },
  );
  return { narrativeQueue, narrativeWorker };
}
