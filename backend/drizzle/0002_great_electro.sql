ALTER TABLE "transactions" DROP CONSTRAINT "transactions_inventory_id_inventory_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE set null ON UPDATE no action;