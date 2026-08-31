-- Create index on inventory grade_company for fast graded/raw aggregations
CREATE INDEX IF NOT EXISTS "idx_inventory_grade_quantity" ON "inventory" ("grade_company", "quantity");

-- Create Materialized View for super-admin cards dashboard metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS "super_admin_cards_metrics_mv" AS
SELECT 
  (SELECT COALESCE(SUM("quantity"), 0)::int FROM "inventory") AS total_cards,
  (SELECT COUNT(DISTINCT "card_id")::int FROM "inventory") AS unique_cards,
  (SELECT COUNT(DISTINCT "variant_id")::int FROM "inventory") AS total_variants,
  (SELECT COALESCE(SUM("quantity"), 0)::int FROM "inventory" 
   WHERE "grade_company" IS NOT NULL 
     AND TRIM("grade_company") != '' 
     AND UPPER("grade_company") != 'RAW'
     AND UPPER(COALESCE("grade_key", '')) != 'RAW'
  ) AS graded_cards,
  (SELECT COALESCE(SUM("quantity"), 0)::int FROM "inventory" 
   WHERE "grade_company" IS NULL 
     OR TRIM("grade_company") = '' 
     OR UPPER("grade_company") = 'RAW'
     OR UPPER("grade_key") = 'RAW'
  ) AS non_graded_cards,
  NOW() AS last_refreshed_at;

-- Create unique index on materialized view to allow CONCURRENT REFRESH
CREATE UNIQUE INDEX IF NOT EXISTS "uq_super_admin_cards_metrics_mv" ON "super_admin_cards_metrics_mv" ("last_refreshed_at");
