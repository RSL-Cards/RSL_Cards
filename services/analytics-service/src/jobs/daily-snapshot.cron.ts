import { Queue, Worker } from "bullmq";
import type { Redis as IORedis } from "ioredis";
import type { FastifyBaseLogger } from "fastify";

export async function startDailySnapshotCron(
  connection: IORedis,
  logger: FastifyBaseLogger,
): Promise<{ snapshotQueue: Queue; snapshotWorker: Worker }> {
  const snapshotQueue = new Queue("analytics-snapshots", { connection });
  const snapshotWorker = new Worker(
    "analytics-snapshots",
    async (job) => {
      const d = (job.data as { date?: string }).date ?? new Date().toISOString().slice(0, 10);
      logger.info("Daily snapshot job started for: " + d);
    },
    { connection },
  );
  snapshotWorker.on("error", (err) => logger.error({ err }, "snapshot worker error"));
  await snapshotQueue.add(
    "snapshot",
    {},
    {
      repeat: { pattern: "0 2 * * *" },
      jobId: "analytics-snapshot-daily",
    },
  );
  return { snapshotQueue, snapshotWorker };
}
