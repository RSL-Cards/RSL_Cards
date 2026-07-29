CREATE TYPE "public"."oauth_provider" AS ENUM('google', 'apple');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('dealer', 'consumer', 'admin');--> statement-breakpoint
CREATE TYPE "public"."grade_company" AS ENUM('PSA', 'BGS', 'SGC', 'CSG', 'RAW');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('unlisted', 'listed', 'sold', 'archived');--> statement-breakpoint
CREATE TYPE "public"."deal_rating" AS ENUM('good_deal', 'fair_price', 'overpaying');--> statement-breakpoint
CREATE TYPE "public"."payment_method_type" AS ENUM('cash', 'venmo', 'zelle', 'paypal', 'cashapp', 'trade', 'other');--> statement-breakpoint
CREATE TYPE "public"."tx_channel" AS ENUM('card_show', 'ebay', 'whatnot', 'mercari', 'tcgplayer', 'facebook', 'shopify', 'comc', 'goldin', 'app', 'myslabs', 'local_store', 'other');--> statement-breakpoint
CREATE TYPE "public"."tx_type" AS ENUM('buy', 'sell', 'trade');--> statement-breakpoint
CREATE TYPE "public"."daily_log_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."listing_platform" AS ENUM('ebay', 'whatnot', 'mercari', 'tcgplayer', 'shopify', 'comc', 'facebook', 'goldin', 'myslabs', 'instagram');--> statement-breakpoint
CREATE TYPE "public"."platform_listing_status" AS ENUM('draft', 'pending', 'active', 'sold', 'ended', 'failed');--> statement-breakpoint
CREATE TYPE "public"."narrative_recommendation" AS ENUM('BUY', 'SELL', 'HOLD', 'PRICE ADJUST');--> statement-breakpoint
CREATE TYPE "public"."narrative_status" AS ENUM('pending_review', 'approved', 'published', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."narrative_type" AS ENUM('breakout', 'injury', 'hype', 'decline', 'seasonal', 'trade', 'hof', 'award', 'auction_record');--> statement-breakpoint
CREATE TYPE "public"."watchlist_tier" AS ENUM('core', 'subscribed', 'on_demand');--> statement-breakpoint
CREATE TYPE "public"."notif_channel" AS ENUM('push', 'email', 'in_app');--> statement-breakpoint
CREATE TYPE "public"."notif_status" AS ENUM('pending', 'sent', 'failed', 'read');--> statement-breakpoint
CREATE TYPE "public"."notif_type" AS ENUM('sale', 'price_alert', 'ai_narrative', 'show_reminder', 'aging_alert', 'offer_received', 'inventory_trending', 'want_list_match', 'platform_alert', 'weekly_digest', 'new_dealer_inventory', 'tax_report_ready', 'system');--> statement-breakpoint
CREATE TYPE "public"."batch_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."batch_type" AS ENUM('image_multi', 'file_upload');--> statement-breakpoint
CREATE TABLE "device_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"fcm_token" varchar(500) NOT NULL,
	"platform" varchar(10) NOT NULL,
	"device_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
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
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"role" "role" DEFAULT 'consumer' NOT NULL,
	"oauth_provider" "oauth_provider",
	"oauth_id" varchar(255),
	"two_factor_secret" varchar(255),
	"two_factor_enabled" boolean DEFAULT false,
	"is_email_verified" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"password_reset_token" varchar(255),
	"password_reset_expiry" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "consumer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"photo_url" varchar(500),
	"sports" text[],
	"teams" text[],
	"players" text[],
	"is_premium" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "consumer_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"email" varchar(255),
	"notes" text,
	"is_favorite" boolean DEFAULT false,
	"total_transactions" integer DEFAULT 0,
	"total_spent" varchar(20) DEFAULT '0',
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dealer_followers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dealer_id" uuid NOT NULL,
	"follower_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dealer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"bio" text,
	"phone" varchar(20),
	"photo_url" varchar(500),
	"sports" text[],
	"sell_channels" text[],
	"custom_url" varchar(100),
	"is_public" boolean DEFAULT true,
	"subscription_plan" varchar(50) DEFAULT 'free',
	"rating" varchar(5) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"follower_count" integer DEFAULT 0,
	"notification_preferences" jsonb DEFAULT '{"priceSpikes":{"push":true,"email":true},"inventoryAging":{"push":false,"email":true},"failedSync":{"push":true,"email":false},"newSales":{"push":true,"email":true},"weeklyReport":{"push":false,"email":true}}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "dealer_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "dealer_profiles_custom_url_unique" UNIQUE("custom_url")
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"handle" varchar(255) NOT NULL,
	"is_default" boolean DEFAULT false,
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
	"notify_daily_close_push" boolean DEFAULT true,
	"notify_daily_close_email" boolean DEFAULT true,
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
CREATE TABLE "inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"card_id" varchar(255),
	"variant_id" uuid,
	"player_id" uuid,
	"year" integer,
	"set_name" varchar(255),
	"variation" varchar(255),
	"card_number" varchar(50),
	"sport" varchar(50),
	"grade_company" varchar(50),
	"grade_value" varchar(10),
	"grade_key" varchar(30),
	"cert_number" varchar(50),
	"cost_basis" numeric(10, 2) NOT NULL,
	"current_market_value" numeric(10, 2),
	"unrealized_gain" numeric(10, 2),
	"quantity" integer DEFAULT 1,
	"is_consignment" boolean DEFAULT false,
	"ebay_sales_completed" text,
	"ebay_active_listings" text,
	"myslabs_sales_completed" text,
	"myslabs_active_listings" text,
	"consignment_owner" varchar(255),
	"consignment_comm_pct" numeric(5, 2),
	"listed_platforms" text[],
	"listing_status" "listing_status" DEFAULT 'unlisted',
	"photos" text[],
	"notes" text,
	"added_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "offline_sync_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"local_id" varchar(255) NOT NULL,
	"type" "tx_type" NOT NULL,
	"payload" text NOT NULL,
	"synced" boolean DEFAULT false,
	"synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "offline_sync_queue_local_id_unique" UNIQUE("local_id")
);
--> statement-breakpoint
CREATE TABLE "trade_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"direction" varchar(10) NOT NULL,
	"inventory_id" uuid,
	"player_name" varchar(255),
	"grade_key" varchar(30),
	"market_value" numeric(10, 2),
	"cash_adjustment" numeric(10, 2) DEFAULT '0'
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"daily_log_id" uuid,
	"inventory_id" uuid,
	"customer_id" uuid,
	"type" "tx_type" NOT NULL,
	"channel" "tx_channel" DEFAULT 'card_show',
	"price" numeric(10, 2) NOT NULL,
	"cost_basis" numeric(10, 2),
	"profit" numeric(10, 2),
	"profit_pct" numeric(8, 2),
	"platform_fee" numeric(10, 2),
	"net_to_dealer" numeric(10, 2),
	"payment_method" "payment_method_type",
	"deal_rating" "deal_rating",
	"comp_price_at_time" numeric(10, 2),
	"player_name" varchar(255),
	"grade_key" varchar(30),
	"card_snapshot" text,
	"is_offline" boolean DEFAULT false,
	"local_id" varchar(255),
	"rsl_card_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "transactions_local_id_unique" UNIQUE("local_id")
);
--> statement-breakpoint
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
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inventory_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"platform" "listing_platform" NOT NULL,
	"platform_listing_id" varchar(255),
	"status" "platform_listing_status" DEFAULT 'draft',
	"list_price" numeric(10, 2) NOT NULL,
	"platform_fee_pct" numeric(5, 2),
	"platform_fee_amt" numeric(10, 2),
	"estimated_shipping" numeric(10, 2),
	"net_to_dealer" numeric(10, 2),
	"title" text,
	"description" text,
	"photos" text[],
	"views" integer DEFAULT 0,
	"watchers" integer DEFAULT 0,
	"offers" integer DEFAULT 0,
	"scheduled_at" timestamp with time zone,
	"listed_at" timestamp with time zone,
	"sold_at" timestamp with time zone,
	"sold_price" numeric(10, 2),
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "card_comp_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
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
CREATE TABLE "card_price_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"grade_key" varchar(30) NOT NULL,
	"avg_sold_price" numeric(10, 2),
	"min_sold_price" numeric(10, 2),
	"max_sold_price" numeric(10, 2),
	"sales_count" integer,
	"price_trend" numeric(8, 2),
	"recorded_date" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "card_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"grade" varchar(30) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'USD',
	"source" varchar(50) NOT NULL,
	"sales_count" integer,
	"last_sold_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "card_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" varchar(255) NOT NULL,
	"rsl_card_id" varchar(255),
	"rsl_card_unique_name" varchar(255),
	"year" integer,
	"set_name" varchar(255),
	"name" varchar(100) NOT NULL,
	"is_parallel" boolean DEFAULT false,
	"is_base" boolean DEFAULT false,
	"is_autograph" boolean DEFAULT false,
	"is_relic" boolean DEFAULT false,
	"print_run" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "card_variants_rsl_card_id_unique" UNIQUE("rsl_card_id"),
	CONSTRAINT "card_variants_rsl_card_unique_name_unique" UNIQUE("rsl_card_unique_name")
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"player_id" uuid NOT NULL,
	"year" integer,
	"set_name" varchar(255),
	"card_number" varchar(50),
	"manufacturer" varchar(100),
	"is_rookie" boolean DEFAULT false,
	"source" varchar(50),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
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
CREATE TABLE "image_hashes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image_hash" varchar(64) NOT NULL,
	"card_id" varchar(255) NOT NULL,
	"variant_id" uuid,
	"confidence" real NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "image_hashes_image_hash_unique" UNIQUE("image_hash")
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
CREATE TABLE "platform_sold_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
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
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"sport" varchar(50) NOT NULL,
	"team" varchar(100),
	"position" varchar(50),
	"rookie_year" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "players_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "price_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"card_id" varchar(255) NOT NULL,
	"grade_key" varchar(30) NOT NULL,
	"target_price" numeric(10, 2) NOT NULL,
	"direction" varchar(10) DEFAULT 'below',
	"is_triggered" boolean DEFAULT false,
	"triggered_at" timestamp with time zone,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "want_list" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"card_id" varchar(255) NOT NULL,
	"grade_key" varchar(30),
	"max_price" numeric(10, 2),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_calendar" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"event_type" varchar(100),
	"sport" varchar(50),
	"scheduled_for" timestamp with time zone NOT NULL,
	"notes" text,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "narratives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_name" varchar(255) NOT NULL,
	"sport" varchar(50),
	"card_ids" text[],
	"headline" varchar(500) NOT NULL,
	"short_summary" varchar(280),
	"body" text NOT NULL,
	"why_it_matters" text,
	"narrative_type" "narrative_type" NOT NULL,
	"price_change_pct" numeric(5, 2),
	"price_direction" varchar(5),
	"price_range" varchar(50),
	"recommendation" "narrative_recommendation",
	"correlated_events" text,
	"status" "narrative_status" DEFAULT 'pending_review',
	"reviewed_by" uuid,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
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
CREATE TABLE "price_anomalies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" varchar(255) NOT NULL,
	"player_name" varchar(255),
	"price_change_pct" numeric(5, 2),
	"window_hours" integer DEFAULT 48,
	"narrative_id" uuid,
	"processed" boolean DEFAULT false,
	"detected_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sportradar_fetch_log" (
	"sport" varchar(50) PRIMARY KEY NOT NULL,
	"last_fetched_date" varchar(10) NOT NULL,
	"last_fetched_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sportradar_news_articles" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"sport" varchar(50) NOT NULL,
	"title" varchar(500) NOT NULL,
	"byline" varchar(255),
	"dateline" varchar(255),
	"content_long" text,
	"is_injury" boolean DEFAULT false,
	"is_transaction" boolean DEFAULT false,
	"published_at" timestamp with time zone,
	"player_refs" text[],
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "card_shows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"venue" varchar(255),
	"address" text,
	"city" varchar(100),
	"state" varchar(50),
	"lat" varchar(20),
	"lng" varchar(20),
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"website" varchar(500),
	"admission" varchar(50),
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (

);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notif_type" NOT NULL,
	"channel" "notif_channel" NOT NULL,
	"status" "notif_status" DEFAULT 'pending',
	"title" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"data" text,
	"read_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"error_msg" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "show_attendees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"show_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) DEFAULT 'attendee',
	"created_at" timestamp with time zone DEFAULT now()
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
CREATE TABLE "daily_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" varchar(10) NOT NULL,
	"cards_bought" integer DEFAULT 0,
	"cards_sold" integer DEFAULT 0,
	"total_spent" numeric(10, 2) DEFAULT '0',
	"total_revenue" numeric(10, 2) DEFAULT '0',
	"net_profit" numeric(10, 2) DEFAULT '0',
	"best_deal_margin" numeric(8, 2),
	"revenue_by_channel" text,
	"revenue_by_payment" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dashboard_counters" (
	"name" text PRIMARY KEY NOT NULL,
	"value" integer DEFAULT 0,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"daily_log_id" uuid,
	"local_id" varchar(255),
	"category" varchar(100),
	"description" varchar(255),
	"amount" numeric(10, 2) NOT NULL,
	"receipt_url" varchar(500),
	"expense_date" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "expenses_local_id_unique" UNIQUE("local_id")
);
--> statement-breakpoint
CREATE TABLE "tax_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tax_year" integer NOT NULL,
	"total_revenue" numeric(12, 2),
	"total_cost_basis" numeric(12, 2),
	"gross_profit" numeric(12, 2),
	"short_term_gains" numeric(12, 2),
	"long_term_gains" numeric(12, 2),
	"platform_fees_paid" numeric(12, 2),
	"total_expenses" numeric(12, 2),
	"report_s3_url" varchar(500),
	"generated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar(255) NOT NULL,
	"resource" varchar(100),
	"resource_id" varchar(255),
	"ip_address" varchar(50),
	"user_agent" text,
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dealer_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dealer_id" uuid NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"is_approved" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" boolean DEFAULT false,
	"description" text,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "feature_flags_key_unique" UNIQUE("key")
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
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumer_profiles" ADD CONSTRAINT "consumer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealer_followers" ADD CONSTRAINT "dealer_followers_dealer_id_users_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealer_followers" ADD CONSTRAINT "dealer_followers_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealer_profiles" ADD CONSTRAINT "dealer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_connections" ADD CONSTRAINT "platform_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bulk_purchases" ADD CONSTRAINT "bulk_purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_variant_id_card_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."card_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offline_sync_queue" ADD CONSTRAINT "offline_sync_queue_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_items" ADD CONSTRAINT "trade_items_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_items" ADD CONSTRAINT "trade_items_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_daily_log_id_daily_logs_id_fk" FOREIGN KEY ("daily_log_id") REFERENCES "public"."daily_logs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_comp_snapshots" ADD CONSTRAINT "card_comp_snapshots_variant_id_card_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."card_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_price_history" ADD CONSTRAINT "card_price_history_variant_id_card_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."card_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_prices" ADD CONSTRAINT "card_prices_variant_id_card_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."card_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_variants" ADD CONSTRAINT "card_variants_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumer_collection" ADD CONSTRAINT "consumer_collection_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumer_collection" ADD CONSTRAINT "consumer_collection_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_hashes" ADD CONSTRAINT "image_hashes_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_hashes" ADD CONSTRAINT "image_hashes_variant_id_card_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."card_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_active_listings" ADD CONSTRAINT "platform_active_listings_variant_id_card_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."card_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_sold_listings" ADD CONSTRAINT "platform_sold_listings_variant_id_card_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."card_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "want_list" ADD CONSTRAINT "want_list_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "want_list" ADD CONSTRAINT "want_list_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_anomalies" ADD CONSTRAINT "price_anomalies_narrative_id_narratives_id_fk" FOREIGN KEY ("narrative_id") REFERENCES "public"."narratives"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "show_attendees" ADD CONSTRAINT "show_attendees_show_id_card_shows_id_fk" FOREIGN KEY ("show_id") REFERENCES "public"."card_shows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "show_attendees" ADD CONSTRAINT "show_attendees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_push_tokens" ADD CONSTRAINT "user_push_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_summaries" ADD CONSTRAINT "daily_summaries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_daily_log_id_daily_logs_id_fk" FOREIGN KEY ("daily_log_id") REFERENCES "public"."daily_logs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_records" ADD CONSTRAINT "tax_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealer_reviews" ADD CONSTRAINT "dealer_reviews_dealer_id_users_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealer_reviews" ADD CONSTRAINT "dealer_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch_jobs" ADD CONSTRAINT "batch_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_device_tokens_user_id" ON "device_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_users_oauth" ON "users" USING btree ("oauth_provider","oauth_id");--> statement-breakpoint
CREATE INDEX "idx_customers_user_id" ON "customers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_dealer_followers_dealer_id" ON "dealer_followers" USING btree ("dealer_id");--> statement-breakpoint
CREATE INDEX "idx_dealer_followers_follower_id" ON "dealer_followers" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_user_id" ON "payment_methods" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_platform" ON "platform_connections" USING btree ("user_id","platform");--> statement-breakpoint
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
CREATE INDEX "idx_daily_logs_user_id" ON "daily_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_daily_logs_status" ON "daily_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_listings_user_id" ON "listings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_listings_inventory_id" ON "listings" USING btree ("inventory_id");--> statement-breakpoint
CREATE INDEX "idx_listings_status" ON "listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_listings_user_status" ON "listings" USING btree ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_comp_variant_grade_platform" ON "card_comp_snapshots" USING btree ("variant_id","grade_key","platform");--> statement-breakpoint
CREATE INDEX "idx_card_price_history_variant_id" ON "card_price_history" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_card_price_history_variant_grade" ON "card_price_history" USING btree ("variant_id","grade_key");--> statement-breakpoint
CREATE INDEX "idx_card_prices_variant_grade" ON "card_prices" USING btree ("variant_id","grade");--> statement-breakpoint
CREATE INDEX "idx_card_prices_variant_id" ON "card_prices" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_card_variants_card_id" ON "card_variants" USING btree ("card_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_variant_card_details" ON "card_variants" USING btree ("card_id","year","set_name","name","print_run");--> statement-breakpoint
CREATE INDEX "idx_card_variants_rsl_card_id" ON "card_variants" USING btree ("rsl_card_id");--> statement-breakpoint
CREATE INDEX "idx_card_variants_rsl_card_unique_name" ON "card_variants" USING btree ("rsl_card_unique_name");--> statement-breakpoint
CREATE INDEX "idx_cards_player_id" ON "cards" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "idx_cards_year" ON "cards" USING btree ("year");--> statement-breakpoint
CREATE INDEX "idx_cards_set_name" ON "cards" USING btree ("set_name");--> statement-breakpoint
CREATE INDEX "idx_cards_card_number" ON "cards" USING btree ("card_number");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_card_player_year_set_number" ON "cards" USING btree ("player_id","year","set_name","card_number");--> statement-breakpoint
CREATE INDEX "idx_consumer_collection_user_id" ON "consumer_collection" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_consumer_collection_card_id" ON "consumer_collection" USING btree ("card_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_image_hash" ON "image_hashes" USING btree ("image_hash");--> statement-breakpoint
CREATE INDEX "idx_image_hashes_card_id" ON "image_hashes" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "idx_image_hashes_variant_id" ON "image_hashes" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_platform_active_variant_id" ON "platform_active_listings" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_platform_active_variant_grade" ON "platform_active_listings" USING btree ("variant_id","grade_key");--> statement-breakpoint
CREATE INDEX "idx_platform_sold_variant_id" ON "platform_sold_listings" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_platform_sold_variant_grade" ON "platform_sold_listings" USING btree ("variant_id","grade_key");--> statement-breakpoint
CREATE INDEX "idx_players_name" ON "players" USING btree ("name");--> statement-breakpoint
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
CREATE INDEX "idx_push_tokens_user_id" ON "user_push_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_daily_summary_user_date" ON "daily_summaries" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_dealer_reviews_dealer_id" ON "dealer_reviews" USING btree ("dealer_id");--> statement-breakpoint
CREATE INDEX "idx_dealer_reviews_reviewer_id" ON "dealer_reviews" USING btree ("reviewer_id");--> statement-breakpoint
CREATE INDEX "idx_batch_jobs_user_id" ON "batch_jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_batch_jobs_status" ON "batch_jobs" USING btree ("status");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."mv_daily_log_stats" AS (select "daily_log_id", sum(case when "type" = 'sell' then "price" else 0 end) as "money_in", sum(case when "type" = 'buy' then "price" else 0 end) as "money_out", sum("profit") as "profit", count(case when "type" = 'buy' then 1 end) as "cards_bought", count(case when "type" = 'sell' then 1 end) as "cards_sold" from "transactions" where "transactions"."daily_log_id" is not null group by "transactions"."daily_log_id");