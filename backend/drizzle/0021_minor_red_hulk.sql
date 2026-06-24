ALTER TABLE "card_variants" ADD COLUMN "rsl_card_unique_name" varchar(255);--> statement-breakpoint
CREATE INDEX "idx_card_variants_rsl_card_unique_name" ON "card_variants" USING btree ("rsl_card_unique_name");--> statement-breakpoint
ALTER TABLE "card_variants" ADD CONSTRAINT "card_variants_rsl_card_unique_name_unique" UNIQUE("rsl_card_unique_name");