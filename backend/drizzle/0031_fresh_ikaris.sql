ALTER TABLE "daily_logs" ADD COLUMN "updated_after_closing" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "local_id" varchar(255);--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_local_id_unique" UNIQUE("local_id");