CREATE TYPE "public"."user_role" AS ENUM('dealer', 'consumer', 'admin');--> statement-breakpoint
CREATE TYPE "public"."inventory_listing_status" AS ENUM('draft', 'listed', 'sold', 'ended', 'pending');--> statement-breakpoint
CREATE TYPE "public"."deal_rating" AS ENUM('good_deal', 'fair_price', 'overpaying');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'card', 'paypal', 'venmo', 'zelle', 'crypto', 'trade_credit', 'other');--> statement-breakpoint
CREATE TYPE "public"."transaction_channel" AS ENUM('ebay', 'whatnot', 'mercari', 'tcgplayer', 'shopify', 'in_person', 'show', 'online', 'trade_show', 'other');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('buy', 'sell', 'trade');--> statement-breakpoint
CREATE TYPE "public"."listing_row_status" AS ENUM('active', 'sold', 'ended', 'pending');--> statement-breakpoint
CREATE TYPE "public"."narrative_type" AS ENUM('market_move', 'player_spotlight', 'portfolio', 'tax', 'general');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'consumer' NOT NULL,
	"oauth_provider" varchar(64),
	"oauth_id" varchar(255),
	"refresh_token_hash" varchar(255),
	"two_factor_secret" varchar(255),
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"fcm_token" varchar(512),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" varchar(255),
	"avatar_url" text,
	"bio" text,
	"location" varchar(255),
	"sport_preference" varchar(128),
	"business_name" varchar(255),
	"tax_id" varchar(64),
	"payment_methods" jsonb,
	"connected_platforms" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_name" varchar(255) NOT NULL,
	"year" integer NOT NULL,
	"set_name" varchar(255) NOT NULL,
	"card_number" varchar(64) NOT NULL,
	"variation" varchar(255),
	"sport" varchar(64) NOT NULL,
	"manufacturer" varchar(128),
	"is_rookie" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"card_id" uuid,
	"player_name" varchar(255) NOT NULL,
	"year" integer NOT NULL,
	"set_name" varchar(255) NOT NULL,
	"grade" varchar(64),
	"cost_basis" numeric(14, 2) NOT NULL,
	"current_market_value" numeric(14, 2) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"is_consignment" boolean DEFAULT false NOT NULL,
	"listing_status" "inventory_listing_status" DEFAULT 'draft' NOT NULL,
	"listed_platforms" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"photos" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"sport" varchar(64) NOT NULL,
	"notes" text,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	"days_held" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"inventory_id" uuid NOT NULL,
	"type" "transaction_type" NOT NULL,
	"channel" "transaction_channel" NOT NULL,
	"price" numeric(14, 2) NOT NULL,
	"cost_basis" numeric(14, 2) NOT NULL,
	"profit" numeric(14, 2) DEFAULT '0' NOT NULL,
	"platform_fee" numeric(14, 2) DEFAULT '0' NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"deal_rating" "deal_rating" DEFAULT 'fair_price' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(64),
	"notes" text,
	"total_purchased" integer DEFAULT 0 NOT NULL,
	"total_spent" numeric(14, 2) DEFAULT '0' NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inventory_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"platform" varchar(64) NOT NULL,
	"platform_listing_id" varchar(255) NOT NULL,
	"status" "listing_row_status" DEFAULT 'pending' NOT NULL,
	"list_price" numeric(14, 2) NOT NULL,
	"platform_fee_pct" numeric(6, 4) NOT NULL,
	"net_to_dealer" numeric(14, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" uuid NOT NULL,
	"avg_price" numeric(14, 2) NOT NULL,
	"last_sale" numeric(14, 2),
	"high_90d" numeric(14, 2),
	"low_90d" numeric(14, 2),
	"source" varchar(64) NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "narratives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"narrative_type" "narrative_type" NOT NULL,
	"headline" varchar(512) NOT NULL,
	"body" text NOT NULL,
	"source_event" text,
	"metadata" text,
	"reviewed_by_admin" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(64) NOT NULL,
	"title" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"card_id" uuid NOT NULL,
	"target_price" numeric(14, 2) NOT NULL,
	"direction" varchar(16) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" varchar(10) NOT NULL,
	"revenue" varchar(32) NOT NULL,
	"cogs" varchar(32) NOT NULL,
	"gross_profit" varchar(32) NOT NULL,
	"cards_bought" integer DEFAULT 0 NOT NULL,
	"cards_sold" integer DEFAULT 0 NOT NULL,
	"by_channel" jsonb,
	"by_sport" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"action" varchar(128) NOT NULL,
	"target_type" varchar(64) NOT NULL,
	"target_id" varchar(128) NOT NULL,
	"details" jsonb,
	"ip_address" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "narratives" ADD CONSTRAINT "narratives_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "narratives" ADD CONSTRAINT "narratives_reviewed_by_admin_users_id_fk" FOREIGN KEY ("reviewed_by_admin") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_admin_user_id_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;