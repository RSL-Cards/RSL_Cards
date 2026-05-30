DROP INDEX "uq_variant_card_details";--> statement-breakpoint
ALTER TABLE "card_variants" ADD COLUMN "year" integer;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_variant_card_details" ON "card_variants" USING btree ("card_id","year","set_name","name","print_run","grading_company","grade_value","cert_number");