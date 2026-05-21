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
	"name" varchar(100) NOT NULL,
	"is_parallel" boolean DEFAULT false,
	"is_base" boolean DEFAULT false,
	"is_autograph" boolean DEFAULT false,
	"is_relic" boolean DEFAULT false,
	"is_memorabilia" boolean DEFAULT false,
	"print_run" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "image_hashes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image_hash" varchar(64) NOT NULL,
	"card_id" varchar(255) NOT NULL,
	"confidence" real NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "image_hashes_image_hash_unique" UNIQUE("image_hash")
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
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "card_comp_snapshots" DROP CONSTRAINT "card_comp_snapshots_card_id_cards_id_fk";
--> statement-breakpoint
ALTER TABLE "card_price_history" DROP CONSTRAINT "card_price_history_card_id_cards_id_fk";
--> statement-breakpoint
ALTER TABLE "platform_sold_listings" DROP CONSTRAINT "platform_sold_listings_card_id_cards_id_fk";
--> statement-breakpoint
DROP INDEX "uq_comp_card_grade_platform";--> statement-breakpoint
ALTER TABLE "card_comp_snapshots" ADD COLUMN "variant_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "card_price_history" ADD COLUMN "variant_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "player_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "platform_sold_listings" ADD COLUMN "variant_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "card_prices" ADD CONSTRAINT "card_prices_variant_id_card_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."card_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_variants" ADD CONSTRAINT "card_variants_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_hashes" ADD CONSTRAINT "image_hashes_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_card_prices_variant_grade" ON "card_prices" USING btree ("variant_id","grade");--> statement-breakpoint
CREATE INDEX "idx_card_prices_variant_id" ON "card_prices" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "idx_card_variants_card_id" ON "card_variants" USING btree ("card_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_variant_card_name_printrun" ON "card_variants" USING btree ("card_id","name","print_run");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_image_hash" ON "image_hashes" USING btree ("image_hash");--> statement-breakpoint
CREATE INDEX "idx_players_name" ON "players" USING btree ("name");--> statement-breakpoint
ALTER TABLE "card_comp_snapshots" ADD CONSTRAINT "card_comp_snapshots_variant_id_card_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."card_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_price_history" ADD CONSTRAINT "card_price_history_variant_id_card_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."card_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_sold_listings" ADD CONSTRAINT "platform_sold_listings_variant_id_card_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."card_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_comp_variant_grade_platform" ON "card_comp_snapshots" USING btree ("variant_id","grade_key","platform");--> statement-breakpoint
CREATE INDEX "idx_cards_player_id" ON "cards" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "idx_cards_year" ON "cards" USING btree ("year");--> statement-breakpoint
CREATE INDEX "idx_cards_set_name" ON "cards" USING btree ("set_name");--> statement-breakpoint
CREATE INDEX "idx_cards_card_number" ON "cards" USING btree ("card_number");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_card_player_year_set_number" ON "cards" USING btree ("player_id","year","set_name","card_number");--> statement-breakpoint
ALTER TABLE "card_comp_snapshots" DROP COLUMN "card_id";--> statement-breakpoint
ALTER TABLE "card_price_history" DROP COLUMN "card_id";--> statement-breakpoint
ALTER TABLE "cards" DROP COLUMN "player_name";--> statement-breakpoint
ALTER TABLE "cards" DROP COLUMN "variation";--> statement-breakpoint
ALTER TABLE "cards" DROP COLUMN "is_autograph";--> statement-breakpoint
ALTER TABLE "cards" DROP COLUMN "is_relic";--> statement-breakpoint
ALTER TABLE "cards" DROP COLUMN "print_run";--> statement-breakpoint
ALTER TABLE "platform_sold_listings" DROP COLUMN "card_id";