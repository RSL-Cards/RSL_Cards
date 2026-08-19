CREATE TYPE "public"."daily_log_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."batch_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."batch_type" AS ENUM('image_multi', 'file_upload');--> statement-breakpoint
ALTER TYPE "public"."tx_channel" ADD VALUE 'myslabs' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."tx_channel" ADD VALUE 'local_store' BEFORE 'other';--> statement-breakpoint
CREATE TABLE "daily_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" "daily_log_status" DEFAULT 'open' NOT NULL,
	"starting_cash" numeric(10, 2) DEFAULT '0',
	"updated_after_closing" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "platform_active_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"grade_key" varchar(30) NOT NULL,
	"platform" "listing_platform" NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"platform_item_id" varchar(255),
	"title" varchar(500),
	"condition" varchar(100),
	"item_web_url" varchar(500),
	"image_url" varchar(500),
	"content_hash" varchar(64),
	"last_seen_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "platform_active_listings_content_hash_unique" UNIQUE("content_hash")
);
--> statement-breakpoint
CREATE TABLE "user_push_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"platform" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_push_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "dashboard_counters" (
	"name" text PRIMARY KEY NOT NULL,
	"value" integer DEFAULT 0,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "batch_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "batch_type" NOT NULL,
	"status" "batch_status" DEFAULT 'pending' NOT NULL,
	"file_url" text,
	"raw_text" text,
	"image_base64" text,
	"results_json" jsonb,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_inventory_id_inventory_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory" ADD COLUMN "myslabs_sales_completed" text;--> statement-breakpoint
ALTER TABLE "inventory" ADD COLUMN "myslabs_active_listings" text;--> statement-breakpoint
ALTER TABLE "inventory" ADD COLUMN "search_string" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "daily_log_id" uuid;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "rsl_card_id" varchar(255);--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "views" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "watchers" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "offers" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "card_variants" ADD COLUMN "rsl_card_id" varchar(255);--> statement-breakpoint
ALTER TABLE "card_variants" ADD COLUMN "rsl_card_unique_name" varchar(255);--> statement-breakpoint
ALTER TABLE "card_variants" ADD COLUMN "search_string" text;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "daily_log_id" uuid;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "local_id" varchar(255);--> statement-breakpoint
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_active_listings" ADD CONSTRAINT "platform_active_listings_variant_id_card_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."card_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_push_tokens" ADD CONSTRAINT "user_push_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch_jobs" ADD CONSTRAINT "batch_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_daily_logs_user_id" ON "daily_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_daily_logs_status" ON "daily_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_platform_active_variant_id" ON "platform_active_listings" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_platform_active_variant_grade" ON "platform_active_listings" USING btree ("variant_id","grade_key");--> statement-breakpoint
CREATE INDEX "idx_push_tokens_user_id" ON "user_push_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_batch_jobs_user_id" ON "batch_jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_batch_jobs_status" ON "batch_jobs" USING btree ("status");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_daily_log_id_daily_logs_id_fk" FOREIGN KEY ("daily_log_id") REFERENCES "public"."daily_logs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_daily_log_id_daily_logs_id_fk" FOREIGN KEY ("daily_log_id") REFERENCES "public"."daily_logs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_device_tokens_user_id" ON "device_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_users_oauth" ON "users" USING btree ("oauth_provider","oauth_id");--> statement-breakpoint
CREATE INDEX "idx_customers_user_id" ON "customers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_dealer_followers_dealer_id" ON "dealer_followers" USING btree ("dealer_id");--> statement-breakpoint
CREATE INDEX "idx_dealer_followers_follower_id" ON "dealer_followers" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_user_id" ON "payment_methods" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_bulk_purchases_user_id" ON "bulk_purchases" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_user_id" ON "inventory" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_card_id" ON "inventory" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_variant_id" ON "inventory" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_player_id" ON "inventory" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_status" ON "inventory" USING btree ("listing_status");--> statement-breakpoint
CREATE INDEX "idx_inventory_grade_key" ON "inventory" USING btree ("grade_key");--> statement-breakpoint
CREATE INDEX "idx_inventory_user_status" ON "inventory" USING btree ("user_id","listing_status");--> statement-breakpoint
CREATE INDEX "idx_inventory_user_status_added" ON "inventory" USING btree ("user_id","listing_status","added_at");--> statement-breakpoint
CREATE INDEX "idx_offline_sync_user_id" ON "offline_sync_queue" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_trade_items_tx_id" ON "trade_items" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "idx_trade_items_inventory_id" ON "trade_items" USING btree ("inventory_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_rsl_card_id" ON "transactions" USING btree ("rsl_card_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_id" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_inventory_id" ON "transactions" USING btree ("inventory_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_customer_id" ON "transactions" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_daily_log_id" ON "transactions" USING btree ("daily_log_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_daily_log_type" ON "transactions" USING btree ("daily_log_id","type");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_type_created" ON "transactions" USING btree ("user_id","type","created_at");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_created" ON "transactions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_transactions_channel" ON "transactions" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "idx_listings_user_id" ON "listings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_listings_inventory_id" ON "listings" USING btree ("inventory_id");--> statement-breakpoint
CREATE INDEX "idx_listings_status" ON "listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_listings_user_status" ON "listings" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_card_price_history_variant_id" ON "card_price_history" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_card_price_history_variant_grade" ON "card_price_history" USING btree ("variant_id","grade_key");--> statement-breakpoint
CREATE INDEX "idx_card_variants_rsl_card_id" ON "card_variants" USING btree ("rsl_card_id");--> statement-breakpoint
CREATE INDEX "idx_card_variants_rsl_card_unique_name" ON "card_variants" USING btree ("rsl_card_unique_name");--> statement-breakpoint
CREATE INDEX "idx_consumer_collection_user_id" ON "consumer_collection" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_consumer_collection_card_id" ON "consumer_collection" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "idx_image_hashes_card_id" ON "image_hashes" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "idx_image_hashes_variant_id" ON "image_hashes" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_platform_sold_variant_id" ON "platform_sold_listings" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_platform_sold_variant_grade" ON "platform_sold_listings" USING btree ("variant_id","grade_key");--> statement-breakpoint
CREATE INDEX "idx_platform_sold_variant_date" ON "platform_sold_listings" USING btree ("variant_id","sold_at");--> statement-breakpoint
CREATE INDEX "idx_price_alerts_user_id" ON "price_alerts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_price_alerts_card_id" ON "price_alerts" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "idx_want_list_user_id" ON "want_list" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_want_list_card_id" ON "want_list" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "idx_narratives_status_created" ON "narratives" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "idx_snapshot_history_player" ON "player_snapshot_history" USING btree ("player_name","fetched_to");--> statement-breakpoint
CREATE INDEX "idx_player_watchlist_tier" ON "player_watchlist" USING btree ("tier","active");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_status" ON "notifications" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_created" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_attendees_show_id" ON "show_attendees" USING btree ("show_id");--> statement-breakpoint
CREATE INDEX "idx_attendees_user_id" ON "show_attendees" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_dealer_reviews_dealer_id" ON "dealer_reviews" USING btree ("dealer_id");--> statement-breakpoint
CREATE INDEX "idx_dealer_reviews_reviewer_id" ON "dealer_reviews" USING btree ("reviewer_id");--> statement-breakpoint
ALTER TABLE "card_variants" ADD CONSTRAINT "card_variants_rsl_card_id_unique" UNIQUE("rsl_card_id");--> statement-breakpoint
ALTER TABLE "card_variants" ADD CONSTRAINT "card_variants_rsl_card_unique_name_unique" UNIQUE("rsl_card_unique_name");--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_local_id_unique" UNIQUE("local_id");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."mv_daily_log_stats" AS (select "daily_log_id", sum(case when "type" = 'sell' then "price" else 0 end) as "money_in", sum(case when "type" = 'buy' then "price" else 0 end) as "money_out", sum("profit") as "profit", count(case when "type" = 'buy' then 1 end) as "cards_bought", count(case when "type" = 'sell' then 1 end) as "cards_sold" from "transactions" where "transactions"."daily_log_id" is not null group by "transactions"."daily_log_id");