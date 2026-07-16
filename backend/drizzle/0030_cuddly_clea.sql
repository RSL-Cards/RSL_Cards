CREATE TYPE "public"."daily_log_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TABLE "daily_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" "daily_log_status" DEFAULT 'open' NOT NULL,
	"starting_cash" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now(),
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "daily_log_id" uuid;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "daily_log_id" uuid;--> statement-breakpoint
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_daily_logs_user_id" ON "daily_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_daily_logs_status" ON "daily_logs" USING btree ("status");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_daily_log_id_daily_logs_id_fk" FOREIGN KEY ("daily_log_id") REFERENCES "public"."daily_logs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_daily_log_id_daily_logs_id_fk" FOREIGN KEY ("daily_log_id") REFERENCES "public"."daily_logs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_transactions_daily_log_id" ON "transactions" USING btree ("daily_log_id");--> statement-breakpoint
CREATE INDEX "idx_transactions_daily_log_type" ON "transactions" USING btree ("daily_log_id","type");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."mv_daily_log_stats" AS (select "daily_log_id", sum(case when "type" = 'sell' then "price" else 0 end) as "money_in", sum(case when "type" = 'buy' then "price" else 0 end) as "money_out", sum("profit") as "profit", count(case when "type" = 'buy' then 1 end) as "cards_bought", count(case when "type" = 'sell' then 1 end) as "cards_sold" from "transactions" where "transactions"."daily_log_id" is not null group by "transactions"."daily_log_id");