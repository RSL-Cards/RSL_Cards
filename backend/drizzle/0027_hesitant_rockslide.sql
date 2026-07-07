CREATE TABLE IF NOT EXISTS "dashboard_counters" (
	"name" text PRIMARY KEY NOT NULL,
	"value" integer DEFAULT 0,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_device_tokens_user_id" ON "device_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_user_id" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_oauth" ON "users" USING btree ("oauth_provider","oauth_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_customers_user_id" ON "customers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dealer_followers_dealer_id" ON "dealer_followers" USING btree ("dealer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dealer_followers_follower_id" ON "dealer_followers" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payment_methods_user_id" ON "payment_methods" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_user_status" ON "inventory" USING btree ("user_id","listing_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_inventory_user_status_added" ON "inventory" USING btree ("user_id","listing_status","added_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_transactions_user_type_created" ON "transactions" USING btree ("user_id","type","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_transactions_user_created" ON "transactions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_transactions_channel" ON "transactions" USING btree ("channel");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_listings_user_id" ON "listings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_listings_inventory_id" ON "listings" USING btree ("inventory_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_listings_status" ON "listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_listings_user_status" ON "listings" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_card_price_history_variant_grade" ON "card_price_history" USING btree ("variant_id","grade_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_platform_active_variant_grade" ON "platform_active_listings" USING btree ("variant_id","grade_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_platform_sold_variant_grade" ON "platform_sold_listings" USING btree ("variant_id","grade_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_narratives_status_created" ON "narratives" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_snapshot_history_player" ON "player_snapshot_history" USING btree ("player_name","fetched_to");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_player_watchlist_tier" ON "player_watchlist" USING btree ("tier","active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_user_status" ON "notifications" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_user_created" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_attendees_show_id" ON "show_attendees" USING btree ("show_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_attendees_user_id" ON "show_attendees" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_push_tokens_user_id" ON "user_push_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_id" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dealer_reviews_dealer_id" ON "dealer_reviews" USING btree ("dealer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dealer_reviews_reviewer_id" ON "dealer_reviews" USING btree ("reviewer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_batch_jobs_user_id" ON "batch_jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_batch_jobs_status" ON "batch_jobs" USING btree ("status");