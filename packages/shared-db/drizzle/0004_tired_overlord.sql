ALTER TABLE "inventory" ADD COLUMN "variant_id" uuid;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_platform" ON "platform_connections" USING btree ("user_id","platform");