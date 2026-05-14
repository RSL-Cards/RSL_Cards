DROP INDEX "uq_variant_card_name_printrun";--> statement-breakpoint
ALTER TABLE "card_variants" ADD COLUMN "grading_company" varchar(50);--> statement-breakpoint
ALTER TABLE "card_variants" ADD COLUMN "grade_value" varchar(20);--> statement-breakpoint
ALTER TABLE "card_variants" ADD COLUMN "cert_number" varchar(100);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_variant_card_details" ON "card_variants" USING btree ("card_id","name","print_run","grading_company","grade_value","cert_number");