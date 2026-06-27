import { pgTable, uuid, text, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const batchStatusEnum = pgEnum("batch_status", ["pending", "processing", "completed", "failed"]);
export const batchTypeEnum = pgEnum("batch_type", ["image_multi", "file_upload"]);

export const batchJobs = pgTable("batch_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: batchTypeEnum("type").notNull(),
  status: batchStatusEnum("status").notNull().default("pending"),
  fileUrl: text("file_url"),
  rawText: text("raw_text"), 
  imageBase64: text("image_base64"), 
  resultsJson: jsonb("results_json"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
