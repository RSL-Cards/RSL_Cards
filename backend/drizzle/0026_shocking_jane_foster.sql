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
