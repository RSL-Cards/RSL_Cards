CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users" ("role");
CREATE INDEX IF NOT EXISTS "idx_inventory_user_status_added" ON "inventory" ("user_id", "listing_status", "added_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_transactions_user_type_created" ON "transactions" ("user_id", "type", "created_at" DESC);
