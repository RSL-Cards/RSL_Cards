ALTER TABLE "inventory" ADD COLUMN "player_id" uuid;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_variant_id_card_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."card_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" DROP COLUMN "player_name";