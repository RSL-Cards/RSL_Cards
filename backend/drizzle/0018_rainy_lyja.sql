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
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "platform_active_listings_content_hash_unique" UNIQUE("content_hash")
);
--> statement-breakpoint
ALTER TABLE "platform_active_listings" ADD CONSTRAINT "platform_active_listings_variant_id_card_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."card_variants"("id") ON DELETE no action ON UPDATE no action;