ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_token" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_expiry" timestamp with time zone;