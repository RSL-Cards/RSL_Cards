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

  async startCronJobs(): Promise<void> {
    try {
      await this.queue.add("refresh_all_comps", {}, {
        repeat: {
          every: 12 * 60 * 60 * 1000 // 12 hours in milliseconds
        },
        jobId: "refresh_all_comps_cron" // prevent duplicates
      });
      logger.info("🕒 Scheduled 'refresh_all_comps' cron job to run every 12 hours");

      await this.queue.add("generate_ai_insights", {}, {
        repeat: {
          every: 6 * 60 * 60 * 1000 // 6 hours in milliseconds
        },
        jobId: "generate_ai_insights_cron"
      });
      logger.info("🕒 Scheduled 'generate_ai_insights' cron job to run every 6 hours");

      await this.queue.add("check_inventory_aging", {}, {
        repeat: {
          every: 12 * 60 * 60 * 1000 // 12 hours in milliseconds
        },
        jobId: "check_inventory_aging_cron"
      });
      logger.info("🕒 Scheduled 'check_inventory_aging' cron job to run every 12 hours");

      await this.queue.add("notify_close_daily_logs", {}, {
        repeat: {
          pattern: "0 23 * * *" // 11:00 PM server time every day
        },
        jobId: "notify_close_daily_logs_cron"
      });
      logger.info("🕒 Scheduled 'notify_close_daily_logs' cron job to run at 11:00 PM daily");
    } catch (err: any) {
      logger.error(`❌ Failed to schedule cron jobs: ${err.message}`);
    }
  }
}

export const bullMqAdapter = new BullMqAdapter();
