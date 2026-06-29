DO $$ 
DECLARE
  v_user_id UUID;
  v_inventory_id UUID;
BEGIN
  -- Get the first user
  SELECT id INTO v_user_id FROM users LIMIT 1;
  
  -- Create a dummy inventory item
  INSERT INTO inventory (id, user_id, year, set_name, player_id, grade_key, cost_basis, listing_status, added_at)
  VALUES (gen_random_uuid(), v_user_id, 2023, 'Topps Chrome', (SELECT id FROM players LIMIT 1), 'PSA_10', 100, 'listed', NOW() - INTERVAL '10 days')
  RETURNING id INTO v_inventory_id;
  
  -- Create an active listing
  INSERT INTO listings (id, inventory_id, user_id, platform, status, list_price, net_to_dealer, views, watchers, offers, listed_at)
  VALUES (gen_random_uuid(), v_inventory_id, v_user_id, 'ebay', 'active', 500, 420, 142, 12, 3, NOW() - INTERVAL '10 days');
  
  -- Create a scheduled listing
  INSERT INTO inventory (id, user_id, year, set_name, player_id, grade_key, cost_basis, listing_status, added_at)
  VALUES (gen_random_uuid(), v_user_id, 2024, 'Panini Prizm', (SELECT id FROM players LIMIT 1), 'RAW', 50, 'listed', NOW())
  RETURNING id INTO v_inventory_id;
  
  INSERT INTO listings (id, inventory_id, user_id, platform, status, list_price, net_to_dealer, views, watchers, offers, scheduled_at)
  VALUES (gen_random_uuid(), v_inventory_id, v_user_id, 'whatnot', 'pending', 150, 130, 0, 0, 0, NOW() + INTERVAL '1 day');
END $$;
