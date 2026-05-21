CREATE TYPE "public"."oauth_provider" AS ENUM('google', 'apple');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('dealer', 'consumer', 'admin');--> statement-breakpoint
CREATE TYPE "public"."grade_company" AS ENUM('PSA', 'BGS', 'SGC', 'CGC', 'RAW');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('unlisted', 'listed', 'sold', 'consignment');--> statement-breakpoint
CREATE TYPE "public"."deal_rating" AS ENUM('good_deal', 'fair_price', 'overpaying');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'venmo', 'zelle', 'paypal', 'cashapp', 'trade', 'other');--> statement-breakpoint
CREATE TYPE "public"."tx_channel" AS ENUM('card_show', 'ebay', 'whatnot', 'mercari', 'tcgplayer', 'facebook', 'shopify', 'comc', 'goldin', 'myslabs', 'instagram', 'other');--> statement-breakpoint
CREATE TYPE "public"."tx_type" AS ENUM('buy', 'sell', 'trade');--> statement-breakpoint
CREATE TYPE "public"."listing_platform" AS ENUM('ebay', 'whatnot', 'mercari', 'tcgplayer', 'shopify', 'comc', 'facebook', 'goldin', 'myslabs', 'instagram');--> statement-breakpoint
CREATE TYPE "public"."platform_listing_status" AS ENUM('draft', 'pending', 'active', 'sold', 'ended', 'failed');--> statement-breakpoint
CREATE TYPE "public"."narrative_status" AS ENUM('pending_review', 'approved', 'published', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."narrative_type" AS ENUM('breakout', 'injury', 'hype', 'decline', 'seasonal', 'trade', 'hof', 'award', 'auction_record', 'anniversary');--> statement-breakpoint
CREATE TYPE "public"."notif_channel" AS ENUM('push', 'email', 'in_app');--> statement-breakpoint
CREATE TYPE "public"."notif_status" AS ENUM('pending', 'sent', 'failed', 'read');--> statement-breakpoint
CREATE TYPE "public"."notif_type" AS ENUM('sale', 'price_alert', 'ai_narrative', 'show_reminder', 'aging_alert', 'offer_received', 'inventory_trending', 'want_list_match', 'platform_alert', 'weekly_digest', 'new_dealer_inventory', 'system');--> statement-breakpoint
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
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"role" "role" DEFAULT 'consumer' NOT NULL,
	"oauth_provider" "oauth_provider",
	"oauth_id" varchar(255),
	"refresh_token_hash" varchar(255),
	"two_factor_secret" varchar(255),
	"two_factor_enabled" boolean DEFAULT false,
	"is_email_verified" boolean DEFAULT false,
	"email_verify_token" varchar(255),
	"password_reset_token" varchar(255),
	"password_reset_expiry" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "connected_platforms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"platform" varchar(50) NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"token_expiry" timestamp with time zone,
	"platform_user_id" varchar(255),
	"platform_username" varchar(255),
	"is_active" boolean DEFAULT true,
	"connected_at" timestamp with time zone DEFAULT now()
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
	"dealer_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"email" varchar(255),
	"notes" text,
	"is_starred" boolean DEFAULT false,
	"total_revenue" varchar(20) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
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
	"subscription_expiry" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "dealer_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "dealer_profiles_custom_url_unique" UNIQUE("custom_url")
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"push_enabled" boolean DEFAULT true,
	"email_enabled" boolean DEFAULT true,
	"sale_notifications" boolean DEFAULT true,
	"price_alerts" boolean DEFAULT true,
	"ai_narratives" boolean DEFAULT true,
	"show_reminders" boolean DEFAULT true,
	"aging_alerts" boolean DEFAULT true,
	"offer_received" boolean DEFAULT true,
	"inventory_trending" boolean DEFAULT true,
	"weekly_digest" boolean DEFAULT true,
	"quiet_hours_start" varchar(5),
	"quiet_hours_end" varchar(5),
	"min_price_move_pct" varchar(5) DEFAULT '10',
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "notification_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" varchar(50) NOT NULL,
	"handle" varchar(255) NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bulk_import_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"file_name" varchar(255),
	"total_rows" integer,
	"processed_rows" integer DEFAULT 0,
	"error_rows" integer DEFAULT 0,
	"s3_key" varchar(500),
	"error_log" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"card_id" varchar(255),
	"player_name" varchar(255) NOT NULL,
	"year" integer,
	"set_name" varchar(255),
	"variation" varchar(255),
	"card_number" varchar(50),
	"sport" varchar(50),
	"grade_company" "grade_company",
	"grade_value" varchar(10),
	"cert_number" varchar(100),
	"cost_basis" numeric(10, 2) NOT NULL,
	"current_market_value" numeric(10, 2),
	"quantity" integer DEFAULT 1,
	"print_run" integer,
	"print_run_serial" integer,
	"is_consignment" boolean DEFAULT false,
	"consignment_owner" varchar(255),
	"consignment_comm_pct" numeric(5, 2),
	"listing_status" "listing_status" DEFAULT 'unlisted',
	"listed_platforms" text[],
	"photos" text[],
	"notes" text,
	"is_rookie" boolean DEFAULT false,
	"is_autograph" boolean DEFAULT false,
	"is_relic" boolean DEFAULT false,
	"last_revalued_at" timestamp with time zone,
	"added_at" timestamp with time zone DEFAULT now(),
	"sold_at" timestamp with time zone,
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
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trade_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"direction" varchar(10) NOT NULL,
	"inventory_id" uuid,
	"player_name" varchar(255),
	"market_value" numeric(10, 2),
	"cash_adjustment" numeric(10, 2) DEFAULT '0'
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
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
	"payment_method" "payment_method",
	"deal_rating" "deal_rating",
	"comp_price_at_time" numeric(10, 2),
	"player_name" varchar(255),
	"card_snapshot" text,
	"is_offline" boolean DEFAULT false,
	"local_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now()
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
	"scheduled_at" timestamp with time zone,
	"listed_at" timestamp with time zone,
	"sold_at" timestamp with time zone,
	"sold_price" numeric(10, 2),
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_price_comps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" varchar(255) NOT NULL,
	"platform" "listing_platform" NOT NULL,
	"current_price" numeric(10, 2),
	"lowest_price" numeric(10, 2),
	"avg_sold_price" numeric(10, 2),
	"fetched_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "card_price_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" varchar(255) NOT NULL,
	"grade_key" varchar(30),
	"avg_sold_price" numeric(10, 2),
	"min_sold_price" numeric(10, 2),
	"max_sold_price" numeric(10, 2),
	"sales_count" integer,
	"price_trend" numeric(8, 2),
	"recorded_date" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"player_name" varchar(255) NOT NULL,
	"year" integer,
	"set_name" varchar(255),
	"variation" varchar(255),
	"card_number" varchar(50),
	"sport" varchar(50),
	"manufacturer" varchar(100),
	"is_rookie" boolean DEFAULT false,
	"is_autograph" boolean DEFAULT false,
	"is_relic" boolean DEFAULT false,
	"print_run" integer,
	"stock_image_url" varchar(500),
	"source" varchar(50),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ebay_recent_sales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" varchar(255) NOT NULL,
	"grade_key" varchar(30),
	"sold_price" numeric(10, 2) NOT NULL,
	"ebay_item_id" varchar(255),
	"sold_at" timestamp with time zone NOT NULL,
	"title" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "price_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"card_id" varchar(255) NOT NULL,
	"grade_key" varchar(30),
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
	"narrative_type" "narrative_type" NOT NULL,
	"price_change_pct" numeric(5, 2),
	"price_direction" varchar(5),
	"correlated_events" text,
	"status" "narrative_status" DEFAULT 'pending_review',
	"reviewed_by" uuid,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
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
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
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
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category" varchar(100),
	"description" varchar(255),
	"amount" numeric(10, 2) NOT NULL,
	"receipt_url" varchar(500),
	"expense_date" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
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
	"expenses" numeric(12, 2),
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
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connected_platforms" ADD CONSTRAINT "connected_platforms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumer_profiles" ADD CONSTRAINT "consumer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_dealer_id_users_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealer_profiles" ADD CONSTRAINT "dealer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bulk_import_jobs" ADD CONSTRAINT "bulk_import_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offline_sync_queue" ADD CONSTRAINT "offline_sync_queue_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_items" ADD CONSTRAINT "trade_items_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_items" ADD CONSTRAINT "trade_items_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_price_history" ADD CONSTRAINT "card_price_history_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ebay_recent_sales" ADD CONSTRAINT "ebay_recent_sales_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "want_list" ADD CONSTRAINT "want_list_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "want_list" ADD CONSTRAINT "want_list_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_anomalies" ADD CONSTRAINT "price_anomalies_narrative_id_narratives_id_fk" FOREIGN KEY ("narrative_id") REFERENCES "public"."narratives"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "show_attendees" ADD CONSTRAINT "show_attendees_show_id_card_shows_id_fk" FOREIGN KEY ("show_id") REFERENCES "public"."card_shows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "show_attendees" ADD CONSTRAINT "show_attendees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_summaries" ADD CONSTRAINT "daily_summaries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_records" ADD CONSTRAINT "tax_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealer_reviews" ADD CONSTRAINT "dealer_reviews_dealer_id_users_id_fk" FOREIGN KEY ("dealer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealer_reviews" ADD CONSTRAINT "dealer_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;