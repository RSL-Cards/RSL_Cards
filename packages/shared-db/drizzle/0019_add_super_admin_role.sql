-- ALTER TYPE ... ADD VALUE cannot be used in the same transaction as later statements that use the value,
-- so it runs between its own COMMIT/BEGIN. Each statement must be sent separately (statement-breakpoint)
-- or Postgres treats the file as one implicit transaction and later migrations fail on a fresh database.
COMMIT;
--> statement-breakpoint
ALTER TYPE "public"."role" ADD VALUE IF NOT EXISTS 'super-admin';
--> statement-breakpoint
BEGIN;
