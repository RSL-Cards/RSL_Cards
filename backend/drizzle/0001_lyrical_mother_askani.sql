CREATE TYPE "public"."payment_method_type" AS ENUM('cash', 'venmo', 'zelle', 'paypal', 'cashapp', 'trade', 'other');--> statement-breakpoint
CREATE TYPE "public"."watchlist_tier" AS ENUM('core', 'subscribed', 'on_demand');--> statement-breakpoint
ALTER TYPE "public"."notif_type" ADD VALUE 'tax_report_ready' BEFORE 'system';--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"device_info" varchar(500),
	"ip_address" varchar(50),
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "refresh_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "dealer_followers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dealer_id" uuid NOT NULL,
	"follower_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"platform" varchar(50) NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"token_expires_at" timestamp with time zone,
	"platform_user_id" varchar(255),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"sale_alerts" boolean DEFAULT true,
	"price_alerts" boolean DEFAULT true,
	"ai_narratives" boolean DEFAULT true,
	"aging_alerts" boolean DEFAULT true,
	"show_reminders" boolean DEFAULT true,
	"want_list_matches" boolean DEFAULT true,
	"weekly_digest" boolean DEFAULT true,
	"quiet_hours_start" varchar(5) DEFAULT '22:00',
	"quiet_hours_end" varchar(5) DEFAULT '08:00',
	"timezone" varchar(50) DEFAULT 'America/New_York',
	"daily_limit" integer DEFAULT 20,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "bulk_purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"item_count" integer NOT NULL,
	"payment_method" varchar(50),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "card_comp_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" varchar(255) NOT NULL,
	"grade_key" varchar(30) NOT NULL,
	"platform" "listing_platform" NOT NULL,
	"avg_sold_price" numeric(10, 2),
	"last_sold_price" numeric(10, 2),
	"lowest_active" numeric(10, 2),
	"sales_count_30d" integer DEFAULT 0,
	"price_trend_30d" numeric(8, 2),
	"fetched_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consumer_collection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"card_id" varchar(255) NOT NULL,
	"grade_key" varchar(30) NOT NULL,
	"cost_basis" numeric(10, 2),
	"current_value" numeric(10, 2),
	"quantity" integer DEFAULT 1,
	"acquired_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_sold_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" varchar(255) NOT NULL,
	"grade_key" varchar(30) NOT NULL,
	"platform" "listing_platform" NOT NULL,
	"sold_price" numeric(10, 2) NOT NULL,
	"platform_item_id" varchar(255),
	"sold_at" timestamp with time zone NOT NULL,
	"title" varchar(500),
	"condition" varchar(100),
	"content_hash" varchar(64),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "platform_sold_listings_content_hash_unique" UNIQUE("content_hash")
);
--> statement-breakpoint
CREATE TABLE "player_snapshot_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_name" varchar(255) NOT NULL,
	"sport" varchar(50),
	"total_score" numeric(5, 2),
	"performance_score" numeric(5, 2),
	"sentiment_score" numeric(5, 2),
	"event_score" numeric(5, 2),
	"momentum_score" numeric(5, 2),
	"liquidity_score" numeric(5, 2),
	"volatility_score" numeric(5, 2),
	"fetched_from" timestamp with time zone,
	"fetched_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "player_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_name" varchar(255) NOT NULL,
	"sport" varchar(50),
	"performance_score" numeric(5, 2),
	"sentiment_score" numeric(5, 2),
	"event_score" numeric(5, 2),
	"momentum_score" numeric(5, 2),
	"liquidity_score" numeric(5, 2),
	"volatility_score" numeric(5, 2),
	"total_score" numeric(5, 2),
	"raw_performance" text,
	"raw_sentiment" text,
	"raw_events" text,
	"raw_comps" text,
	"last_fetched_at" timestamp with time zone,
	"narrative_generated" boolean DEFAULT false,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "player_snapshots_player_name_unique" UNIQUE("player_name")
);
--> statement-breakpoint
CREATE TABLE "player_watchlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_name" varchar(255) NOT NULL,
	"sport" varchar(50) NOT NULL,
	"tier" "watchlist_tier" NOT NULL,
	"holder_count" integer DEFAULT 0,
	"active" boolean DEFAULT true,
	"last_checked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "player_watchlist_player_name_unique" UNIQUE("player_name")
);
--> statement-breakpoint
ALTER TABLE "connected_platforms" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "bulk_import_jobs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "platform_price_comps" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ebay_recent_sales" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "connected_platforms" CASCADE;--> statement-breakpoint
DROP TABLE "bulk_import_jobs" CASCADE;--> statement-breakpoint
DROP TABLE "platform_price_comps" CASCADE;--> statement-breakpoint
DROP TABLE "ebay_recent_sales" CASCADE;--> statement-breakpoint
ALTER TABLE "notification_preferences" DROP CONSTRAINT "notification_preferences_user_id_unique";--> statement-breakpoint
ALTER TABLE "customers" DROP CONSTRAINT "customers_dealer_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "notification_preferences" DROP CONSTRAINT "notification_preferences_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory" ALTER COLUMN "cert_number" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "payment_method" SET DATA TYPE payment_method_type USING "payment_method"::text::payment_method_type;--> statement-breakpoint
ALTER TABLE "card_price_history" ALTER COLUMN "grade_key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "price_alerts" ALTER COLUMN "grade_key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "is_favorite" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "total_transactions" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "total_spent" varchar(20) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "last_seen_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "dealer_profiles" ADD COLUMN "rating" varchar(5) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "dealer_profiles" ADD COLUMN "review_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "dealer_profiles" ADD COLUMN "follower_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "type" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory" ADD COLUMN "grade_key" varchar(30);--> statement-breakpoint
ALTER TABLE "inventory" ADD COLUMN "unrealized_gain" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "trade_items" ADD COLUMN "grade_key" varchar(30);--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "grade_key" varchar(30);--> statement-breakpoint
ALTER TABLE "narratives" ADD COLUMN "why_it_matters" text;--> statement-breakpoint
ALTER TABLE "card_shows" ADD COLUMN "admission" varchar(50);--> statement-breakpoint
ALTER TABLE "card_shows" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "tax_records" ADD COLUMN "total_expenses" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "tax_records" ADD COLUMN "report_s3_url" varchar(500);--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealer_followers" ADD CONSTRAINT "dealer_followers_dealer_id_users_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealer_followers" ADD CONSTRAINT "dealer_followers_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_connections" ADD CONSTRAINT "platform_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bulk_purchases" ADD CONSTRAINT "bulk_purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_comp_snapshots" ADD CONSTRAINT "card_comp_snapshots_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumer_collection" ADD CONSTRAINT "consumer_collection_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumer_collection" ADD CONSTRAINT "consumer_collection_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_sold_listings" ADD CONSTRAINT "platform_sold_listings_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_comp_card_grade_platform" ON "card_comp_snapshots" USING btree ("card_id","grade_key","platform");--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_daily_summary_user_date" ON "daily_summaries" USING btree ("user_id","date");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "refresh_token_hash";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "email_verify_token";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password_reset_token";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password_reset_expiry";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "dealer_id";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "is_starred";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "total_revenue";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "dealer_profiles" DROP COLUMN "subscription_expiry";--> statement-breakpoint
ALTER TABLE "notification_preferences" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "notification_preferences" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "notification_preferences" DROP COLUMN "push_enabled";--> statement-breakpoint
ALTER TABLE "notification_preferences" DROP COLUMN "email_enabled";--> statement-breakpoint
ALTER TABLE "notification_preferences" DROP COLUMN "sale_notifications";--> statement-breakpoint
ALTER TABLE "notification_preferences" DROP COLUMN "price_alerts";--> statement-breakpoint
ALTER TABLE "notification_preferences" DROP COLUMN "ai_narratives";--> statement-breakpoint
ALTER TABLE "notification_preferences" DROP COLUMN "show_reminders";--> statement-breakpoint
ALTER TABLE "notification_preferences" DROP COLUMN "aging_alerts";--> statement-breakpoint
ALTER TABLE "notification_preferences" DROP COLUMN "offer_received";--> statement-breakpoint
ALTER TABLE "notification_preferences" DROP COLUMN "inventory_trending";--> statement-breakpoint
ALTER TABLE "notification_preferences" DROP COLUMN "weekly_digest";--> statement-breakpoint
ALTER TABLE "notification_preferences" DROP COLUMN "quiet_hours_start";--> statement-breakpoint
ALTER TABLE "notification_preferences" DROP COLUMN "quiet_hours_end";--> statement-breakpoint
ALTER TABLE "notification_preferences" DROP COLUMN "min_price_move_pct";--> statement-breakpoint
ALTER TABLE "notification_preferences" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "payment_methods" DROP COLUMN "provider";--> statement-breakpoint
ALTER TABLE "inventory" DROP COLUMN "print_run";--> statement-breakpoint
ALTER TABLE "inventory" DROP COLUMN "print_run_serial";--> statement-breakpoint
ALTER TABLE "inventory" DROP COLUMN "is_rookie";--> statement-breakpoint
ALTER TABLE "inventory" DROP COLUMN "is_autograph";--> statement-breakpoint
ALTER TABLE "inventory" DROP COLUMN "is_relic";--> statement-breakpoint
ALTER TABLE "inventory" DROP COLUMN "last_revalued_at";--> statement-breakpoint
ALTER TABLE "inventory" DROP COLUMN "sold_at";--> statement-breakpoint
ALTER TABLE "tax_records" DROP COLUMN "expenses";--> statement-breakpoint
ALTER TABLE "offline_sync_queue" ADD CONSTRAINT "offline_sync_queue_local_id_unique" UNIQUE("local_id");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_local_id_unique" UNIQUE("local_id");--> statement-breakpoint
ALTER TABLE "public"."inventory" ALTER COLUMN "grade_company" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."grade_company";--> statement-breakpoint
CREATE TYPE "public"."grade_company" AS ENUM('PSA', 'BGS', 'SGC', 'CSG', 'RAW');--> statement-breakpoint
ALTER TABLE "public"."inventory" ALTER COLUMN "grade_company" SET DATA TYPE "public"."grade_company" USING "grade_company"::"public"."grade_company";--> statement-breakpoint
ALTER TABLE "public"."inventory" ALTER COLUMN "listing_status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "public"."inventory" ALTER COLUMN "listing_status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."listing_status";--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('unlisted', 'listed', 'sold', 'archived');--> statement-breakpoint
ALTER TABLE "public"."inventory" ALTER COLUMN "listing_status" SET DATA TYPE "public"."listing_status" USING "listing_status"::"public"."listing_status";--> statement-breakpoint
ALTER TABLE "public"."inventory" ALTER COLUMN "listing_status" SET DEFAULT 'unlisted';--> statement-breakpoint
ALTER TABLE "public"."transactions" ALTER COLUMN "channel" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "public"."transactions" ALTER COLUMN "channel" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."tx_channel";--> statement-breakpoint
CREATE TYPE "public"."tx_channel" AS ENUM('card_show', 'ebay', 'whatnot', 'mercari', 'tcgplayer', 'facebook', 'shopify', 'comc', 'goldin', 'app', 'other');--> statement-breakpoint
ALTER TABLE "public"."transactions" ALTER COLUMN "channel" SET DATA TYPE "public"."tx_channel" USING "channel"::"public"."tx_channel";--> statement-breakpoint
ALTER TABLE "public"."transactions" ALTER COLUMN "channel" SET DEFAULT 'card_show';--> statement-breakpoint
ALTER TABLE "public"."narratives" ALTER COLUMN "narrative_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."narrative_type";--> statement-breakpoint
CREATE TYPE "public"."narrative_type" AS ENUM('breakout', 'injury', 'hype', 'decline', 'seasonal', 'trade', 'hof', 'award', 'auction_record');--> statement-breakpoint
ALTER TABLE "public"."narratives" ALTER COLUMN "narrative_type" SET DATA TYPE "public"."narrative_type" USING "narrative_type"::"public"."narrative_type";--> statement-breakpoint
DROP TYPE "public"."payment_method";--> statement-breakpoint