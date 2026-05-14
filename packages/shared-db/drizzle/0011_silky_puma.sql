DROP INDEX "uq_variant_card_details";--> statement-breakpoint
CREATE UNIQUE INDEX "uq_variant_card_details" ON "card_variants" USING btree ("card_id","year","set_name","name","print_run");--> statement-breakpoint
ALTER TABLE "card_variants" DROP COLUMN "grading_company";--> statement-breakpoint
ALTER TABLE "card_variants" DROP COLUMN "grade_value";--> statement-breakpoint
ALTER TABLE "card_variants" DROP COLUMN "cert_number";