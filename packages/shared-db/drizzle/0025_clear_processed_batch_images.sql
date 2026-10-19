-- Scan images used to stay in batch_jobs forever (several MB each). Processed images live in S3,
-- so drop the copies for jobs that have finished.
UPDATE "batch_jobs" SET "image_base64" = NULL WHERE "status" IN ('completed', 'failed') AND "image_base64" IS NOT NULL;
