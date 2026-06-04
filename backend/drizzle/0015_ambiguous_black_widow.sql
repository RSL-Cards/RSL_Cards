ALTER TABLE "transactions" ADD COLUMN "rsl_card_id" varchar(255);--> statement-breakpoint
ALTER TABLE "card_variants" ADD COLUMN "rsl_card_id" varchar(255);--> statement-breakpoint
CREATE INDEX "idx_transactions_rsl_card_id" ON "transactions" USING btree ("rsl_card_id");--> statement-breakpoint
CREATE INDEX "idx_card_variants_rsl_card_id" ON "card_variants" USING btree ("rsl_card_id");--> statement-breakpoint
ALTER TABLE "card_variants" ADD CONSTRAINT "card_variants_rsl_card_id_unique" UNIQUE("rsl_card_id");