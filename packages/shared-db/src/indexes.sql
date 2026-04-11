-- ================================================================
-- AUTH SERVICE INDEXES
-- ================================================================
CREATE UNIQUE INDEX idx_users_email        ON users(email);
CREATE        INDEX idx_users_role         ON users(role);
CREATE UNIQUE INDEX idx_refresh_token_hash ON refresh_tokens(token_hash);
CREATE        INDEX idx_refresh_user_id    ON refresh_tokens(user_id);
CREATE        INDEX idx_device_tokens_user ON device_tokens(user_id);
 
-- ================================================================
-- USER SERVICE INDEXES
-- ================================================================
CREATE UNIQUE INDEX idx_dealer_profile_user   ON dealer_profiles(user_id);
CREATE UNIQUE INDEX idx_consumer_profile_user ON consumer_profiles(user_id);
CREATE UNIQUE INDEX idx_dealer_custom_url      ON dealer_profiles(custom_url);
CREATE        INDEX idx_payment_methods_user   ON payment_methods(user_id);
CREATE        INDEX idx_platform_conn_user     ON platform_connections(user_id, platform);
CREATE UNIQUE INDEX idx_user_preferences_user  ON user_preferences(user_id);
CREATE        INDEX idx_dealer_followers_dealer ON dealer_followers(dealer_id);
CREATE        INDEX idx_dealer_followers_follower ON dealer_followers(follower_id);
CREATE        INDEX idx_customers_user         ON customers(user_id);
 
-- ================================================================
-- INVENTORY SERVICE INDEXES  (HIT ON EVERY DEALER SCREEN)
-- ================================================================
CREATE INDEX idx_inventory_user_id        ON inventory(user_id);
CREATE INDEX idx_inventory_listing_status ON inventory(listing_status);
CREATE INDEX idx_inventory_card_id        ON inventory(card_id);
CREATE INDEX idx_inventory_added_at       ON inventory(added_at);        -- for aging alerts
CREATE INDEX idx_inventory_user_status    ON inventory(user_id, listing_status);  -- composite
CREATE INDEX idx_inventory_player         ON inventory(player_name);     -- for want list match
 
-- ================================================================
-- TRANSACTION SERVICE INDEXES  (HIT ON EVERY REPORT QUERY)
-- ================================================================
CREATE INDEX idx_transactions_user_created ON transactions(user_id, created_at DESC);  -- MOST IMPORTANT
CREATE INDEX idx_transactions_type         ON transactions(type);
CREATE INDEX idx_transactions_channel      ON transactions(channel);
CREATE INDEX idx_transactions_customer     ON transactions(customer_id);
CREATE UNIQUE INDEX idx_transactions_local_id ON transactions(local_id); -- dedup offline sync
CREATE INDEX idx_transactions_user_type_date ON transactions(user_id, type, created_at DESC);
CREATE INDEX idx_trade_items_transaction   ON trade_items(transaction_id);
 
-- ================================================================
-- LISTING SERVICE INDEXES
-- ================================================================
CREATE INDEX idx_listings_inventory_id    ON listings(inventory_id, status);
CREATE INDEX idx_listings_user_id         ON listings(user_id, status);
CREATE INDEX idx_listings_platform_id     ON listings(platform_listing_id, platform);  -- webhook lookup
CREATE INDEX idx_listings_status          ON listings(status);
 
-- ================================================================
-- CARD DB SERVICE INDEXES  (HIT ON EVERY BUY FLOW SCAN)
-- ================================================================
CREATE        INDEX idx_cards_player_name    ON cards(player_name);
CREATE        INDEX idx_cards_sport          ON cards(sport);
CREATE        INDEX idx_cards_year_set       ON cards(year, set_name);
 
-- platformSoldListings: hit every time comps are fetched
CREATE        INDEX idx_sold_card_grade      ON platform_sold_listings(card_id, grade_key);
CREATE        INDEX idx_sold_platform_date   ON platform_sold_listings(platform, sold_at DESC);
CREATE        INDEX idx_sold_card_grade_plat ON platform_sold_listings(card_id, grade_key, platform);
CREATE UNIQUE INDEX idx_sold_content_hash    ON platform_sold_listings(content_hash);   -- dedup
 
-- cardCompSnapshots: hit on every BUY screen load
CREATE UNIQUE INDEX idx_comp_card_grade_plat ON card_comp_snapshots(card_id, grade_key, platform);
CREATE        INDEX idx_comp_fetched_at      ON card_comp_snapshots(fetched_at);
 
-- cardPriceHistory: hit on chart render
CREATE INDEX idx_price_hist_card_grade ON card_price_history(card_id, grade_key, recorded_date DESC);
 
-- priceAlerts: hit every 15-minute evaluation cron
CREATE INDEX idx_price_alerts_user    ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_active  ON price_alerts(is_active, is_triggered);
CREATE INDEX idx_price_alerts_card    ON price_alerts(card_id, grade_key);
 
-- wantList: hit when dealer adds card (match check)
CREATE INDEX idx_want_list_user       ON want_list(user_id);
CREATE INDEX idx_want_list_card_grade ON want_list(card_id, grade_key);
 
-- consumerCollection: hit on portfolio load
CREATE INDEX idx_collection_user      ON consumer_collection(user_id);
CREATE INDEX idx_collection_card      ON consumer_collection(card_id);
 
-- ================================================================
-- AI NARRATIVE SERVICE INDEXES
-- ================================================================
CREATE UNIQUE INDEX idx_watchlist_player    ON player_watchlist(player_name);
CREATE        INDEX idx_watchlist_tier      ON player_watchlist(tier, active);
CREATE        INDEX idx_watchlist_active    ON player_watchlist(active);
 
CREATE UNIQUE INDEX idx_snapshot_player     ON player_snapshots(player_name);
CREATE        INDEX idx_snapshot_fetched    ON player_snapshots(last_fetched_at);
 
CREATE INDEX idx_snapshot_hist_player ON player_snapshot_history(player_name, created_at DESC);
 
CREATE INDEX idx_narratives_player  ON narratives(player_name, published_at DESC);
CREATE INDEX idx_narratives_status  ON narratives(status);
CREATE INDEX idx_narratives_type    ON narratives(narrative_type);
 
-- ================================================================
-- NOTIFICATION SERVICE INDEXES
-- ================================================================
CREATE INDEX idx_notifications_user   ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_unread ON notifications(user_id, status) WHERE status = 'pending';
CREATE INDEX idx_shows_start_date     ON card_shows(start_date);
CREATE INDEX idx_shows_city           ON card_shows(city, state);
CREATE INDEX idx_attendees_show       ON show_attendees(show_id);
CREATE INDEX idx_attendees_user       ON show_attendees(user_id);
 
-- ================================================================
-- ANALYTICS SERVICE INDEXES
-- ================================================================
CREATE UNIQUE INDEX idx_daily_sum_user_date ON daily_summaries(user_id, date);
CREATE        INDEX idx_tax_records_user    ON tax_records(user_id, tax_year);
CREATE        INDEX idx_expenses_user       ON expenses(user_id, expense_date);
 
-- ================================================================
-- ADMIN SERVICE INDEXES
-- ================================================================
CREATE UNIQUE INDEX idx_feature_flags_key   ON feature_flags(key);
CREATE        INDEX idx_dealer_reviews_dealer ON dealer_reviews(dealer_id, is_approved);
CREATE        INDEX idx_audit_logs_user     ON audit_logs(user_id, created_at DESC);
CREATE        INDEX idx_audit_logs_action   ON audit_logs(action, created_at DESC);
