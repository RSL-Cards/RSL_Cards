-- Create index for fast super-admin paginated inventory queries ordered by added_at
CREATE INDEX IF NOT EXISTS "idx_inventory_added_at_desc" ON "inventory" ("added_at" DESC);
