-- Create index for fast paginated users query ordered by created_at
CREATE INDEX IF NOT EXISTS "idx_users_created_at_desc" ON "users" ("created_at" DESC);
