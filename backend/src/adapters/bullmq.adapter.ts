import { Queue, QueueEvents } from "bullmq";
import { redisAdapter } from "./redis.adapter.js";
import { logger } from "../lib/logger.js";
import { BULLMQ_CONFIG } from "../config/redisKeys.js";

export class BullMqAdapter {
  private queue: Queue;
  private queueEvents: QueueEvents;

  constructor() {
    logger.info("🔌 Initializing BullMQ Task Queue...");
    const connection = redisAdapter.getClient();

    this.queue = new Queue(BULLMQ_CONFIG.QUEUE_NAME, {
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

    this.queueEvents = new QueueEvents(BULLMQ_CONFIG.QUEUE_NAME, { connection });

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

  async startCronJobs(): Promise<void> {
    try {
      logger.info("🕒 Synchronizing BullMQ repeatable cron jobs...");

      // Clean up stale repeatable jobs to avoid duplicates or frozen static jobId schedules
      try {
        const existingRepeatable = await this.queue.getRepeatableJobs();
        for (const rJob of existingRepeatable) {
          await this.queue.removeRepeatableByKey(rJob.key);
          logger.info(`🧹 Cleaned up existing repeatable job key: ${rJob.key}`);
        }
      } catch (cleanErr: any) {
        logger.warn(`⚠️ Could not clean existing repeatable jobs: ${cleanErr.message}`);
      }

      await this.queue.add(
        BULLMQ_CONFIG.JOBS.REFRESH_ALL_COMPS,
        {},
        {
          repeat: {
            every: 12 * 60 * 60 * 1000, // 12 hours in milliseconds
          },
          removeOnComplete: 50,
          removeOnFail: 100,
        }
      );
      logger.info(`🕒 Scheduled '${BULLMQ_CONFIG.JOBS.REFRESH_ALL_COMPS}' repeatable job to run every 12 hours`);

      await this.queue.add(
        BULLMQ_CONFIG.JOBS.CHECK_INVENTORY_AGING,
        {},
        {
          repeat: {
            every: 12 * 60 * 60 * 1000, // 12 hours in milliseconds
          },
          removeOnComplete: 50,
          removeOnFail: 100,
        }
      );
      logger.info(`🕒 Scheduled '${BULLMQ_CONFIG.JOBS.CHECK_INVENTORY_AGING}' repeatable job to run every 12 hours`);

      await this.queue.add(
        BULLMQ_CONFIG.JOBS.NOTIFY_CLOSE_DAILY_LOGS,
        {},
        {
          repeat: {
            pattern: "0 * * * *", // Hourly check for worldwide 11:00 PM local time
          },
          removeOnComplete: 50,
          removeOnFail: 100,
        }
      );
      logger.info(`🕒 Scheduled '${BULLMQ_CONFIG.JOBS.NOTIFY_CLOSE_DAILY_LOGS}' repeatable job to run hourly for global 11:00 PM local time checks`);

      await this.queue.add(
        BULLMQ_CONFIG.JOBS.SEND_WEEKLY_PERFORMANCE_REPORT,
        {},
        {
          repeat: {
            pattern: "0 9 * * 0", // 9:00 AM US Eastern Time every Sunday
            tz: "America/New_York",
          },
          removeOnComplete: 50,
          removeOnFail: 100,
        }
      );
      logger.info(`🕒 Scheduled '${BULLMQ_CONFIG.JOBS.SEND_WEEKLY_PERFORMANCE_REPORT}' repeatable job to run every Sunday at 9:00 AM EST`);
    } catch (err: any) {
      logger.error(`❌ Failed to schedule cron jobs: ${err.message}`);
    }
  }
}

export const bullMqAdapter = new BullMqAdapter();
