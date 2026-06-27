import { eq, desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { batchJobs } from "../../db/schema/batch.js";
import { bullMqAdapter } from "../../adapters/bullmq.adapter.js";

export class BatchService {
  async createFileUploadJob(userId: string, rawText: string) {
    // 1. Create a DB record
    const [job] = await db
      .insert(batchJobs)
      .values({
        userId,
        type: "file_upload",
        status: "pending",
        rawText,
      })
      .returning();

    // 2. Queue BullMQ task
    const queue = bullMqAdapter.getQueue();
    await queue.add("process_batch_upload", { batchId: job.id, userId });

    return { jobId: job.id };
  }

  async createMultiScanJob(userId: string, imageBase64: string) {
    const [job] = await db
      .insert(batchJobs)
      .values({
        userId,
        type: "image_multi",
        status: "pending",
        imageBase64,
      })
      .returning();

    const queue = bullMqAdapter.getQueue();
    await queue.add("process_multi_scan", { batchId: job.id, userId });

    return { jobId: job.id };
  }

  async getUserJobs(userId: string) {
    return db
      .select({
        id: batchJobs.id,
        type: batchJobs.type,
        status: batchJobs.status,
        createdAt: batchJobs.createdAt,
      })
      .from(batchJobs)
      .where(eq(batchJobs.userId, userId))
      .orderBy(desc(batchJobs.createdAt))
      .limit(20);
  }

  async getJob(userId: string, jobId: string) {
    const jobs = await db
      .select()
      .from(batchJobs)
      .where(eq(batchJobs.id, jobId));
    if (!jobs.length) {
      throw new Error("Job not found");
    }
    const job = jobs[0];
    if (job.userId !== userId) {
      throw new Error("Unauthorized");
    }
    return job;
  }
}
