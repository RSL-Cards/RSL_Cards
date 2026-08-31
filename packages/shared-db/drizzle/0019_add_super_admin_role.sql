COMMIT;
ALTER TYPE "public"."role" ADD VALUE IF NOT EXISTS 'super-admin';
BEGIN;
