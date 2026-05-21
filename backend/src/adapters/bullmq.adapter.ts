import { Queue, QueueEvents } from "bullmq";
import { redisAdapter } from "./redis.adapter.js";
import { logger } from "../lib/logger.js";

export class BullMqAdapter {
  private queue: Queue;
  private queueEvents: QueueEvents;

  constructor() {
    logger.info("🔌 Initializing BullMQ Task Queue...");
    const connection = redisAdapter.getClient();

    this.queue = new Queue("rsl-task-queue", {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });

    this.queueEvents = new QueueEvents("rsl-task-queue", { connection });

    this.queueEvents.on("error", (err) => {
      logger.error(`❌ BullMQ QueueEvents error: ${err.message}`);
    });
  }

  getQueue(): Queue {
    return this.queue;
  }

  async addJob(name: string, data: any): Promise<any> {
    try {
      logger.info(`📦 BullMQ: Adding job '${name}' to queue...`);
      const job = await this.queue.add(name, data);
      logger.info(`✅ BullMQ: Job '${name}' added successfully (ID: ${job.id})`);
      return job;
    } catch (err: any) {
      logger.error(`❌ BullMQ: Failed to add job '${name}': ${err.message}`);
      throw err;
    }
  }

  async checkHealth(): Promise<{ status: "healthy" | "unhealthy"; jobCounts?: any; error?: string }> {
    try {
      // Connect check and query active job counts
      const counts = await this.queue.getJobCounts(
        "active",
        "completed",
        "failed",
        "delayed",
        "waiting"
      );
      return {
        status: "healthy",
        jobCounts: counts,
      };
    } catch (err: any) {
      return {
        status: "unhealthy",
        error: err.message,
      };
    }
  }

  async close(): Promise<void> {
    try {
      await this.queue.close();
      await this.queueEvents.close();
      logger.info("🔌 BullMQ Queue and QueueEvents closed gracefully");
    } catch (err: any) {
      logger.error(`BullMQ close error: ${err.message}`);
    }
  }
}

export const bullMqAdapter = new BullMqAdapter();
