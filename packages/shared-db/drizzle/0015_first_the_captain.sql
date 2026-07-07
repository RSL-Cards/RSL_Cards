DO $$ BEGIN
    CREATE TYPE "public"."narrative_recommendation" AS ENUM('BUY', 'SELL', 'HOLD', 'PRICE ADJUST');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sportradar_fetch_log" (
	"sport" varchar(50) PRIMARY KEY NOT NULL,
	"last_fetched_date" varchar(10) NOT NULL,
	"last_fetched_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sportradar_news_articles" (
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
ALTER TABLE "narratives" ADD COLUMN IF NOT EXISTS "price_range" varchar(50);--> statement-breakpoint
ALTER TABLE "narratives" ADD COLUMN IF NOT EXISTS "recommendation" "narrative_recommendation";