CREATE TYPE "public"."narrative_recommendation" AS ENUM('BUY', 'SELL', 'HOLD', 'PRICE ADJUST');--> statement-breakpoint
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
ALTER TABLE "narratives" ADD COLUMN "price_range" varchar(50);--> statement-breakpoint
ALTER TABLE "narratives" ADD COLUMN "recommendation" "narrative_recommendation";--> statement-breakpoint
ALTER TABLE "user_push_tokens" ADD CONSTRAINT "user_push_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;