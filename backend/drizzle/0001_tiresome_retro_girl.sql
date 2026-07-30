ALTER TABLE "inventory" ADD COLUMN IF NOT EXISTS "search_string" text;--> statement-breakpoint
ALTER TABLE "card_variants" ADD COLUMN IF NOT EXISTS "search_string" text;