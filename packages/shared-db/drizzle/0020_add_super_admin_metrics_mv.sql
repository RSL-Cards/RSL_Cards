-- Create composite indexes for fast user and inventory aggregation
CREATE INDEX IF NOT EXISTS "idx_users_role_created" ON "users" ("role", "created_at");
CREATE INDEX IF NOT EXISTS "idx_inventory_quantity_status" ON "inventory" ("quantity", "listing_status");

-- Create Materialized View for super-admin dashboard metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS "super_admin_dashboard_metrics_mv" AS
SELECT 
  (SELECT COUNT(*)::int FROM "users") AS total_users,
  (SELECT COUNT(*)::int FROM "users" WHERE "role" = 'dealer') AS total_dealers,
  (SELECT COUNT(*)::int FROM "users" WHERE "role" = 'consumer') AS total_consumers,
  (SELECT COUNT(*)::int FROM "users" WHERE "role" = 'admin') AS total_admins,
  (SELECT COUNT(*)::int FROM "users" WHERE "role" = 'super-admin') AS total_super_admins,
  (SELECT COALESCE(SUM("quantity"), 0)::int FROM "inventory") AS total_inventory_cards,
  (SELECT COUNT(DISTINCT "card_id")::int FROM "inventory") AS total_unique_cards,
  (SELECT COUNT(DISTINCT "variant_id")::int FROM "inventory") AS total_card_variants,
  NOW() AS last_refreshed_at;

-- Create unique index on materialized view to allow CONCURRENT REFRESH
CREATE UNIQUE INDEX IF NOT EXISTS "uq_super_admin_dashboard_metrics_mv" ON "super_admin_dashboard_metrics_mv" ("last_refreshed_at");
