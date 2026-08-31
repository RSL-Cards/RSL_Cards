import { Worker } from "bullmq";
import { redisAdapter } from "./adapters/redis.adapter.js";
import { logger } from "./lib/logger.js";
import { db } from "./db/index.js";
import { sql, eq } from "drizzle-orm";
import { env } from "./config/index.js";
import { ListingRepository } from "./modules/listing/listing.repository.js";
import { EbayService } from "./modules/listing/ebay.service.js";
import { SoldCompsService } from "./modules/listing/sold-comps.service.js";
import { MyslabsService } from "./modules/listing/myslabs.service.js";
import { bullMqAdapter } from "./adapters/bullmq.adapter.js";
import { sseService } from "./modules/notification/sse.service.js";
import { NotificationRepository } from "./modules/notification/notification.repository.js";
import { NotificationService } from "./modules/notification/notification.service.js";
import { batchJobs } from "./db/schema/batch.js";
import { narratives } from "./db/schema/index.js";
import { vertexAiClient } from "./lib/vertex-ai.client.js";
import { MULTI_CARD_SCAN_PROMPT, TEXT_EXTRACTION_PROMPT } from "./config/prompts.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import {
  buildCompsFetchParams,
  normalizeCompsGradeKey,
} from "./modules/listing/comps-query.util.js";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const listingRepo = new ListingRepository();
const ebayService = new EbayService(env);
const soldCompsService = new SoldCompsService(env);
const myslabsService = new MyslabsService(env);

// Helper for generating card ID consistently
const norm = (s: string | null | undefined) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
import { BULLMQ_CONFIG } from "./config/redisKeys.js";

const generateCardId = (c: any) =>
  [norm(c.player_name), c.year, norm(c.set_name), norm(c.card_number || "")].join("_").slice(0, 255);

export const initWorker = () => {
  logger.info("👷 Starting BullMQ Worker for background tasks...");

  const worker = new Worker(
    BULLMQ_CONFIG.QUEUE_NAME,
    async (job) => {
      // -------------------------------------------------------------
      // EXISTING JOBS
      // -------------------------------------------------------------
      if (job.name === BULLMQ_CONFIG.JOBS.REFRESH_ALL_COMPS) {
        logger.info(`[WORKER] Running refresh_all_comps job (ID: ${job.id})`);
        try {
          // Query active daily logs count for system metrics report
          const activeLogsRes = await db.execute(sql`
            SELECT COUNT(*)::int as active_count FROM daily_logs WHERE status = 'open'
          `);
          const activeDailyLogsCount = Number(activeLogsRes.rows[0]?.active_count || 0);

          // Fetch all active inventory card variants & specific grades that exist in dealer inventory
          const invResult = await db.execute(sql`
            SELECT DISTINCT
              cv.id as variant_id,
              c.year,
              c.set_name,
              c.card_number,
              p.name as player_name,
              cv.name as variant_name,
              cv.search_string,
              i.grade_key,
              i.grade_company,
              i.grade_value
            FROM inventory i
            JOIN card_variants cv ON i.variant_id = cv.id
            JOIN cards c ON cv.card_id = c.id
            JOIN players p ON c.player_id = p.id
            WHERE i.listing_status IN ('unlisted', 'listed')
              AND cv.id IS NOT NULL
          `);
          const itemsToEnqueue = (invResult.rows as any[]).map((row) => ({
            variant_id: row.variant_id,
            year: row.year,
            set_name: row.set_name,
            card_number: row.card_number,
            player_name: row.player_name,
            variant_name: row.variant_name,
            search_string: row.search_string,
            grade_key: row.grade_key || "RAW",
            grade_company: row.grade_company || (row.grade_key && row.grade_key !== "RAW" ? "PSA" : null),
            grade_value: row.grade_value || (row.grade_key && row.grade_key !== "RAW" ? row.grade_key : null),
          }));

          const batchId = `comp_batch_${Date.now()}`;
          const queue = bullMqAdapter.getQueue();
          const totalEnqueued = itemsToEnqueue.length;
          logger.info(`[WORKER] Found ${totalEnqueued} active inventory card/grade items to refresh.`);

          // Initialize Batch Metadata in Redis using Atomic Hash
          const redis = redisAdapter.getClient();
          const hashKey = `comp_batch_hash:${batchId}`;
          const startTimeIso = new Date().toISOString();

          await redis.hset(hashKey, {
            batchId,
            totalEnqueued: String(totalEnqueued),
            processedCount: "0",
            successCount: "0",
            failedCount: "0",
            totalSoldStored: "0",
            totalActiveStored: "0",
            activeDailyLogsCount: String(activeDailyLogsCount),
            startTime: startTimeIso,
            targetEmail: "support@rslcards.com",
          });
          await redis.expire(hashKey, 86400);

          logger.info(`[WORKER] Initialized comp batch ${batchId} with ${totalEnqueued} total items enqueued.`);

          if (totalEnqueued === 0) {
            const { emailService } = await import("./modules/email/index.js");
            await emailService.sendCompRefreshReport("support@rslcards.com", {
              batchId,
              totalEnqueued: 0,
              processedCount: 0,
              successCount: 0,
              failedCount: 0,
              totalSoldStored: 0,
              totalActiveStored: 0,
              activeDailyLogsCount,
              startTime: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
              endTime: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
              durationSeconds: 0,
              failedItems: [],
            });
            return { success: true, processed: 0 };
          }

          // Use Queue.addBulk with a 300ms staggered delay for fast, non-blocking queueing
          const bulkJobs = itemsToEnqueue.map((item, index) => ({
            name: "refresh_single_comp",
            data: { item, batchId },
            opts: { delay: index * 300 },
          }));

          const CHUNK_SIZE = 500;
          for (let i = 0; i < bulkJobs.length; i += CHUNK_SIZE) {
            const chunk = bulkJobs.slice(i, i + CHUNK_SIZE);
            await queue.addBulk(chunk);
          }

          logger.info(`[WORKER] Completed spawner job for batch ${batchId}. Bulk enqueued ${totalEnqueued} comp refreshes across all grades.`);
          return { success: true, processed: totalEnqueued, batchId };
        } catch (error: any) {
          logger.error(`[WORKER] Failed to process refresh_all_comps: ${error.message}`);
          throw error;
        }
      } 
      
      else if (job.name === "refresh_single_comp") {
        const { item, batchId } = job.data;
        const fetchParams = {
          ...buildCompsFetchParams({
            player_name: item.player_name,
            year: item.year,
            set_name: item.set_name,
            variant_name: item.variant_name,
            card_number: item.card_number,
            grade_key: item.grade_key,
            grade_company: item.grade_company,
            grade_value: item.grade_value,
            variant_id: item.variant_id,
            search_string: item.search_string,
          }, 20),
          forceRefresh: true
        };

        logger.info(
          `[WORKER] Fetching live comps for item (${batchId || "standalone"}): ${fetchParams.q} (Grade: ${fetchParams.grade_key})`,
        );

        let soldStored = 0;
        let activeStored = 0;
        let isSuccess = true;
        let errorMessage = "";

        try {
          try {
            const ebayRes = await listingRepo.ebaySold(fetchParams, ebayService, soldCompsService);
            soldStored += ebayRes?.last30Days?.items?.length || 0;
            activeStored += ebayRes?.activeListings?.length || 0;
          } catch (err: any) {
            isSuccess = false;
            errorMessage = `eBay: ${err.message}`;
            logger.error(`[WORKER] Error fetching eBay comps: ${err.message}`);
          }
          
          await delay(1500); // Avoid rate limits

          try { 
            const myslabsRes = await listingRepo.myslabsSold(fetchParams, myslabsService);
            soldStored += myslabsRes?.last30Days?.items?.length || 0;
            activeStored += myslabsRes?.activeListings?.length || 0;
          } catch (err: any) { 
            if (!errorMessage) errorMessage = `MySlabs: ${err.message}`;
            logger.error(`[WORKER] Error fetching MySlabs comps: ${err.message}`); 
          }

          await delay(1500); // Avoid rate limits

          // Sync fresh comp snapshots, market values & JSON comp arrays directly to inventory rows
          if (item.variant_id) {
            try {
              const snapRes = await db.execute(sql`
                SELECT avg_sold_price, lowest_active, last_sold_price
                FROM card_comp_snapshots
                WHERE variant_id = ${item.variant_id}
                  AND grade_key = ${fetchParams.grade_key}
                ORDER BY fetched_at DESC LIMIT 1
              `);

              const activeListingsRes = await db.execute(sql`
                SELECT platform_item_id, price, title, condition, item_web_url, image_url, platform, grade_key
                FROM platform_active_listings
                WHERE variant_id = ${item.variant_id}
                ORDER BY price ASC LIMIT 50
              `);

              const soldListingsRes = await db.execute(sql`
                SELECT platform_item_id, sold_price, title, condition, sold_at, platform, grade_key
                FROM platform_sold_listings
                WHERE variant_id = ${item.variant_id}
                ORDER BY sold_at DESC LIMIT 50
              `);

              const ebayActive = activeListingsRes.rows
                .filter((r: any) => !r.platform || String(r.platform).toLowerCase() === 'ebay')
                .map((r: any) => ({
                  itemId: r.platform_item_id,
                  title: r.title,
                  condition: r.condition,
                  grade_key: r.grade_key,
                  price: { value: r.price },
                  itemWebUrl: r.item_web_url,
                  image: { imageUrl: r.image_url },
                  platform: 'eBay'
                }));

              const myslabsActive = activeListingsRes.rows
                .filter((r: any) => r.platform && String(r.platform).toLowerCase() === 'myslabs')
                .map((r: any) => ({
                  itemId: r.platform_item_id,
                  title: r.title,
                  condition: r.condition,
                  grade_key: r.grade_key,
                  price: { value: r.price },
                  itemWebUrl: r.item_web_url,
                  image: { imageUrl: r.image_url },
                  platform: 'MySlabs'
                }));

              const ebaySold = soldListingsRes.rows
                .filter((r: any) => !r.platform || String(r.platform).toLowerCase() === 'ebay')
                .map((r: any) => ({
                  itemId: r.platform_item_id,
                  title: r.title,
                  condition: r.condition,
                  grade_key: r.grade_key,
                  soldPrice: { value: r.sold_price },
                  endDate: r.sold_at,
                  platform: 'eBay'
                }));

              const myslabsSold = soldListingsRes.rows
                .filter((r: any) => r.platform && String(r.platform).toLowerCase() === 'myslabs')
                .map((r: any) => ({
                  itemId: r.platform_item_id,
                  title: r.title,
                  condition: r.condition,
                  grade_key: r.grade_key,
                  soldPrice: { value: r.sold_price },
                  endDate: r.sold_at,
                  platform: 'MySlabs'
                }));

              let newMarketVal = 0;
              if (snapRes.rows.length > 0) {
                const snap = snapRes.rows[0] as any;
                const avgPrice = parseFloat(String(snap.avg_sold_price || "0"));
                const lastSold = parseFloat(String(snap.last_sold_price || "0"));
                const lowestActive = parseFloat(String(snap.lowest_active || "0"));
                newMarketVal = avgPrice > 0 ? avgPrice : (lastSold > 0 ? lastSold : lowestActive);
              }

              const marketValNum = Number(newMarketVal.toFixed(2));

              await db.execute(sql`
                UPDATE inventory
                SET 
                  current_market_value = CASE WHEN ${marketValNum}::numeric > 0 THEN ${marketValNum}::numeric ELSE current_market_value END,
                  unrealized_gain = CASE WHEN ${marketValNum}::numeric > 0 THEN (${marketValNum}::numeric - cost_basis) * COALESCE(quantity, 1) ELSE unrealized_gain END,
                  ebay_active_listings = CASE WHEN ${ebayActive.length > 0} THEN ${JSON.stringify(ebayActive)} ELSE ebay_active_listings END,
                  ebay_sales_completed = CASE WHEN ${ebaySold.length > 0} THEN ${JSON.stringify(ebaySold)} ELSE ebay_sales_completed END,
                  myslabs_active_listings = CASE WHEN ${myslabsActive.length > 0} THEN ${JSON.stringify(myslabsActive)} ELSE myslabs_active_listings END,
                  myslabs_sales_completed = CASE WHEN ${myslabsSold.length > 0} THEN ${JSON.stringify(myslabsSold)} ELSE myslabs_sales_completed END,
                  updated_at = NOW()
                WHERE variant_id = ${item.variant_id}
                  AND (grade_key = ${fetchParams.grade_key} OR grade_key IS NULL)
              `);

              logger.info(`[WORKER] Synced market value ($${newMarketVal}) & comps to inventory for variant ${item.variant_id} (${fetchParams.grade_key})`);
            } catch (syncErr: any) {
              logger.error(`[WORKER] Error syncing comps to inventory for variant ${item.variant_id}: ${syncErr.message}`);
            }
          }
          
          // Dynamically trigger Price Spikes Check for this variant
          try {
            const queue = bullMqAdapter.getQueue();
            await queue.add("check_price_spikes", {
              variant_id: item.variant_id,
              grade_key: fetchParams.grade_key,
              item,
            });
          } catch (spikeErr: any) {
            logger.error(`[WORKER] Error triggering check_price_spikes: ${spikeErr.message}`);
          }
        } catch (topErr: any) {
          isSuccess = false;
          errorMessage = topErr.message;
          logger.error(`[WORKER] Unhandled error processing refresh_single_comp: ${topErr.message}`);
        } finally {
          // Guaranteed Atomic Batch Progress Tracking in Redis
          if (batchId) {
            try {
              const redis = redisAdapter.getClient();
              const hashKey = `comp_batch_hash:${batchId}`;

              const pCount = await redis.hincrby(hashKey, "processedCount", 1);
              if (isSuccess) {
                await redis.hincrby(hashKey, "successCount", 1);
              } else {
                await redis.hincrby(hashKey, "failedCount", 1);
                if (errorMessage) {
                  const failedItemJson = JSON.stringify({
                    itemName: `${item.year || ''} ${item.player_name || ''} ${item.set_name || ''}`.trim(),
                    gradeKey: item.grade_key || 'RAW',
                    error: errorMessage || 'API fetch error',
                  });
                  await redis.rpush(`comp_batch_failed:${batchId}`, failedItemJson);
                }
              }

              if (soldStored > 0) await redis.hincrby(hashKey, "totalSoldStored", soldStored);
              if (activeStored > 0) await redis.hincrby(hashKey, "totalActiveStored", activeStored);
              await redis.expire(hashKey, 86400);

              const totalEnqueuedStr = await redis.hget(hashKey, "totalEnqueued");
              const totalEnqueued = parseInt(totalEnqueuedStr || "0", 10);

              logger.info(
                `[WORKER] Batch ${batchId} progress: ${pCount}/${totalEnqueued} processed.`
              );

              // Guaranteed single report email delivery on batch completion
              const emailSentKey = `comp_batch_email_sent:${batchId}`;
              const alreadySent = await redis.get(emailSentKey);

              if (!alreadySent && totalEnqueued > 0 && pCount >= totalEnqueued) {
                const isLockAcquired = await redis.set(emailSentKey, "1", "EX", 86400, "NX");
                if (isLockAcquired) {
                  const hashData = await redis.hgetall(hashKey);
                  const failedItemsRaw = await redis.lrange(`comp_batch_failed:${batchId}`, 0, -1);
                  const failedItems = failedItemsRaw.map((str) => {
                    try { return JSON.parse(str); } catch { return { itemName: "Unknown", gradeKey: "", error: str }; }
                  });

                  const endTime = new Date();
                  const startTimeDate = new Date(hashData.startTime || Date.now());
                  const durationSeconds = Math.max(1, Math.round((endTime.getTime() - startTimeDate.getTime()) / 1000));

                  const targetEmail = hashData.targetEmail || "support@rslcards.com";
                  logger.info(
                    `[WORKER] 📧 Batch ${batchId} COMPLETED! Sending single report email to ${targetEmail}...`
                  );

                  try {
                    const { emailService } = await import("./modules/email/index.js");
                    await emailService.sendCompRefreshReport(targetEmail, {
                      batchId,
                      totalEnqueued: parseInt(hashData.totalEnqueued || "0", 10),
                      processedCount: parseInt(hashData.processedCount || "0", 10),
                      successCount: parseInt(hashData.successCount || "0", 10),
                      failedCount: parseInt(hashData.failedCount || "0", 10),
                      totalSoldStored: parseInt(hashData.totalSoldStored || "0", 10),
                      totalActiveStored: parseInt(hashData.totalActiveStored || "0", 10),
                      activeDailyLogsCount: parseInt(hashData.activeDailyLogsCount || "0", 10),
                      startTime: startTimeDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
                      endTime: endTime.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
                      durationSeconds,
                      failedItems,
                    });
                    logger.info(`[WORKER] ✅ Admin report email sent successfully to ${targetEmail}!`);
                  } catch (emailErr: any) {
                    logger.error(`[WORKER] ❌ Failed to send comp refresh report email: ${emailErr.message}`);
                  }
                }
              }
            } catch (batchErr: any) {
              logger.error(`[WORKER] Error updating batch progress for ${batchId}: ${batchErr.message}`);
            }
          }

          return { success: isSuccess, processed: item.variant_id };
        }
      }

      else if (job.name === "check_price_spikes") {
        const { variant_id, grade_key, item } = job.data;
        const normalizedGradeKey = normalizeCompsGradeKey(
          grade_key,
          item?.grade_company,
          item?.grade_value,
        );
        logger.info(`[WORKER] Running check_price_spikes for variant ${variant_id} (Grade: ${normalizedGradeKey})`);

        try {
          // Fetch the latest comp
          const compsResult = await db.execute(sql`
            SELECT avg_sold_price FROM card_comp_snapshots 
            WHERE variant_id = ${variant_id} AND grade_key = ${normalizedGradeKey}
            ORDER BY fetched_at DESC LIMIT 1
          `);
          if (compsResult.rows.length === 0) return { success: true, message: "No comp data" };
          const currentMarketValue = Number(compsResult.rows[0].avg_sold_price);

          // Find inventory where currentMarketValue > cost_basis * 1.10
          const spikeInventory = await db.execute(sql`
            SELECT i.id as inventory_id, i.cost_basis, i.user_id, dp.notification_preferences, u.email as user_email
            FROM inventory i
            JOIN dealer_profiles dp ON dp.user_id = i.user_id
            JOIN users u ON u.id = i.user_id
            WHERE i.variant_id = ${variant_id} 
              AND i.grade_key = ${item.grade_key}
              AND i.listing_status IN ('unlisted', 'listed')
              AND i.cost_basis > 0
              AND ${currentMarketValue} > (i.cost_basis * 1.10)
          `);

          const matches = spikeInventory.rows as any[];
          logger.info(`[WORKER] Found ${matches.length} dealers with +10% price spike on variant ${variant_id}`);

          if (matches.length > 0) {
            const { emailService } = await import("./modules/email/index.js");
            
            for (const match of matches) {
              const prefs = match.notification_preferences?.priceSpikes || { push: true, email: true };
              
              const title = `Price Spike Alert: ${item.player_name}`;
              const body = `Great news! Your ${item.year} ${item.player_name} ${item.set_name} (${item.variant_name}) ${normalizedGradeKey === "RAW" ? "RAW" : item.grade_key || normalizedGradeKey} has seen a price spike.\n\nYour Cost Basis: $${Number(match.cost_basis).toFixed(2)}\nCurrent Market Value: $${currentMarketValue.toFixed(2)}`;
              
              if (prefs.push) {
                await sseService.publish(match.user_id, {
                  type: "INFO",
                  title: title,
                  message: body,
                  timestamp: new Date().toISOString()
                });
              }

              if (prefs.email) {
                await emailService.sendNotificationAlert(match.user_email, {
                  alertTitle: title,
                  alertBody: body,
                  actionUrl: `https://app.rslcards.com/inventory?search=${encodeURIComponent(item.player_name)}`,
                  actionText: "View Inventory"
                });
              }
            }
          }

          return { success: true, matches: matches.length };
        } catch (error: any) {
          logger.error(`[WORKER] Error in check_price_spikes: ${error.message}`);
          throw error;
        }
      }

      else if (job.name === "notify_close_daily_logs") {
        logger.info(`[WORKER] Running notify_close_daily_logs cron job`);
        try {
          const openLogs = await db.execute(sql`
            SELECT dl.id, dl.user_id, dl.name, u.email as user_email, 
                   dp.notification_preferences,
                   up.notify_daily_close_push,
                   up.notify_daily_close_email,
                   COALESCE(up.timezone, 'Asia/Kolkata') as timezone
            FROM daily_logs dl
            JOIN users u ON u.id = dl.user_id
            LEFT JOIN dealer_profiles dp ON dp.user_id = dl.user_id
            LEFT JOIN user_preferences up ON up.user_id = dl.user_id
            WHERE dl.status = 'open'
          `);
          
          const logs = openLogs.rows as any[];
          logger.info(`[WORKER] Found ${logs.length} open daily logs across timezones.`);

          const { NotificationRepository } = await import("./modules/notification/notification.repository.js");
          const { emailService } = await import("./modules/email/index.js");
          const notifRepository = new NotificationRepository();

          const now = new Date();
          let notifiedCount = 0;

          for (const log of logs) {
            const userTimezone = log.timezone || "Asia/Kolkata";
            let localHour = 23;
            try {
              const hourStr = new Intl.DateTimeFormat("en-US", {
                timeZone: userTimezone,
                hour: "2-digit",
                hour12: false
              }).format(now);
              localHour = parseInt(hourStr, 10);
            } catch (tzErr) {
              logger.warn(`[WORKER] Invalid timezone ${userTimezone} for user ${log.user_id}, falling back to hour check.`);
            }

            logger.info(`[WORKER_DAILY_LOG] Evaluating Log "${log.name}" (ID: ${log.id}, User: ${log.user_id}): Timezone=${userTimezone}, Computed Local Hour=${localHour}:00`);

            // Only trigger notification when local hour in user's timezone is 23 (11:00 PM), unless force: true
            if (!job.data?.force && localHour !== 23) {
              continue;
            }
            notifiedCount++;

            const isPushEnabled = log.notify_daily_close_push !== false;
            const isEmailEnabled = log.notify_daily_close_email !== false;

            const title = "Close Your Daily Log";
            const body = `Don't forget to close your daily log "${log.name}" for today to finalize your stats.`;
            
            // 1. Send push notification / save to DB
            if (isPushEnabled) {
              await notifRepository.sendNotification(log.user_id, title, body, "system", { logId: log.id });
              
              // Publish to SSE for real-time frontend updates
              await sseService.publish(log.user_id, {
                type: "INFO",
                title,
                message: body,
                timestamp: new Date().toISOString()
              });
            }

            // 2. Send email notification
            if (isEmailEnabled && log.user_email) {
              await emailService.sendNotificationAlert(log.user_email, {
                alertTitle: title,
                alertBody: body,
                actionUrl: "https://app.rslcards.com/daily-logs",
                actionText: "Manage Daily Logs"
              });
              logger.info(`[WORKER] Sent daily log close email alert to ${log.user_email}`);
            }
          }
          return { success: true, processed: logs.length };
        } catch (error: any) {
          logger.error(`[WORKER] Error in notify_close_daily_logs: ${error.message}`);
          throw error;
        }
      }

      else if (job.name === "check_inventory_aging") {
        logger.info(`[WORKER] Running check_inventory_aging cron job`);
        try {
          const agingInventory = await db.execute(sql`
            SELECT i.id as inventory_id, i.added_at, i.user_id, dp.notification_preferences, u.email as user_email,
                   c.player_id, p.name as player_name, c.year, c.set_name, cv.name as variant_name
            FROM inventory i
            JOIN dealer_profiles dp ON dp.user_id = i.user_id
            JOIN users u ON u.id = i.user_id
            JOIN card_variants cv ON cv.id = i.variant_id
            JOIN cards c ON c.id = cv.card_id
            JOIN players p ON p.id = c.player_id
            WHERE i.listing_status IN ('unlisted', 'listed')
              AND i.added_at < now() - interval '60 days'
          `);

          const matches = agingInventory.rows as any[];
          logger.info(`[WORKER] Found ${matches.length} aging inventory items (> 60 days)`);

          if (matches.length > 0) {
            const { emailService } = await import("./modules/email/index.js");
            
            for (const match of matches) {
              const prefs = match.notification_preferences?.inventoryAging || { push: false, email: true };
              if (!prefs.push && !prefs.email) continue;
              
              const title = `Aging Inventory Alert`;
              const body = `Your ${match.year} ${match.player_name} ${match.set_name} (${match.variant_name}) has been sitting in your inventory for over 60 days.\n\nConsider running a sale or updating the price.`;
              
              if (prefs.push) {
                await sseService.publish(match.user_id, {
                  type: "INFO",
                  title: title,
                  message: body,
                  timestamp: new Date().toISOString()
                });
              }

              if (prefs.email) {
                await emailService.sendNotificationAlert(match.user_email, {
                  alertTitle: title,
                  alertBody: body,
                  actionUrl: `https://app.rslcards.com/inventory?search=${encodeURIComponent(match.player_name)}`,
                  actionText: "Manage Inventory"
                });
              }
            }
          }

          return { success: true, processed: matches.length };
        } catch (error: any) {
          logger.error(`[WORKER] Error in check_inventory_aging: ${error.message}`);
          throw error;
        }
      }

      else if (job.name === "send_weekly_performance_report") {
        logger.info(`[WORKER] Running send_weekly_performance_report cron job`);
        try {
          const dealers = await db.execute(sql`
            SELECT u.id as user_id, u.email as user_email, u.name as user_name, dp.notification_preferences
            FROM users u
            JOIN dealer_profiles dp ON dp.user_id = u.id
          `);

          const rows = dealers.rows as any[];
          logger.info(`[WORKER] Found ${rows.length} total dealer accounts to check for weekly performance report.`);

          const { emailService } = await import("./modules/email/index.js");
          const { NotificationRepository } = await import("./modules/notification/notification.repository.js");
          const notifRepository = new NotificationRepository();

          let sentCount = 0;

          for (const dealer of rows) {
            const prefs = dealer.notification_preferences?.weeklyPerformanceReport ?? { push: true, email: true };
            const isEmailEnabled = prefs.email !== false;
            const isPushEnabled = prefs.push !== false;

            if (!isEmailEnabled && !isPushEnabled) continue;

            // Fetch 7-day sales metrics
            const salesResult = await db.execute(sql`
              SELECT 
                COALESCE(SUM(price), 0) as total_revenue,
                COALESCE(SUM(profit), 0) as total_profit,
                COUNT(*) as cards_sold
              FROM transactions
              WHERE user_id = ${dealer.user_id}
                AND type = 'sell'
                AND created_at >= NOW() - INTERVAL '7 days'
            `);

            // Fetch 7-day new inventory added count
            const inventoryResult = await db.execute(sql`
              SELECT COUNT(*) as new_cards_added
              FROM inventory
              WHERE user_id = ${dealer.user_id}
                AND added_at >= NOW() - INTERVAL '7 days'
            `);

            const salesRow = salesResult.rows[0] as any;
            const invRow = inventoryResult.rows[0] as any;

            const totalRevenue = parseFloat(salesRow?.total_revenue || "0");
            const totalProfit = parseFloat(salesRow?.total_profit || "0");
            const cardsSold = parseInt(salesRow?.cards_sold || "0", 10);
            const newCardsAdded = parseInt(invRow?.new_cards_added || "0", 10);

            const title = "Your Weekly Performance Report";
            const body =
              `Here is your 7-day performance breakdown:\n\n` +
              `• 7-Day Revenue: $${totalRevenue.toFixed(2)}\n` +
              `• Net Profit: $${totalProfit.toFixed(2)}\n` +
              `• Cards Sold: ${cardsSold}\n` +
              `• New Cards Added: ${newCardsAdded}\n\n` +
              `View detailed analytics on your RSL Dashboard.`;

            if (isPushEnabled) {
              await notifRepository.sendNotification(dealer.user_id, title, body, "system", {});
              await sseService.publish(dealer.user_id, {
                type: "INFO",
                title,
                message: body,
                timestamp: new Date().toISOString(),
              });
            }

            if (isEmailEnabled && dealer.user_email) {
              await emailService.sendNotificationAlert(dealer.user_email, {
                alertTitle: title,
                alertBody: body,
                actionUrl: "https://app.rslcards.com/reports",
                actionText: "View Performance Analytics",
              });
            }

            sentCount++;
          }

          return { success: true, processed: sentCount };
        } catch (error: any) {
          logger.error(`[WORKER] Error in send_weekly_performance_report: ${error.message}`);
          throw error;
        }
      }

      /* 
      else if (job.name === "generate_ai_insights") {
        const { userId } = job.data || {};
        logger.info(`[WORKER] Running generate_ai_insights job (ID: ${job.id}) ${userId ? `for User: ${userId}` : "Globally"}`);
        try {
          // 1. Fetch top cards in user active inventory with price shifts >= 15% in last 30 days
          const candidates = await db.execute(sql`
            SELECT 
              p.name as player_name,
              p.sport,
              c.id as card_id,
              c.year,
              c.set_name,
              cv.name as variant_name,
              cs.avg_sold_price as price,
              cs.price_trend_30d as change,
              cs.grade_key,
              cs.variant_id
            FROM card_comp_snapshots cs
            JOIN card_variants cv ON cs.variant_id = cv.id
            JOIN cards c ON cv.card_id = c.id
            JOIN players p ON c.player_id = p.id
            WHERE cs.price_trend_30d IS NOT NULL 
              AND abs(cs.price_trend_30d) >= 15
              AND EXISTS (
                SELECT 1 FROM inventory i 
                WHERE i.variant_id = cs.variant_id 
                  AND i.grade_key = cs.grade_key 
                  AND i.listing_status IN ('unlisted', 'listed')
                  ${userId ? sql`AND i.user_id = ${userId}` : sql``}
              )
            ORDER BY abs(cs.price_trend_30d) DESC
            LIMIT 10
          `);

          const items = candidates.rows as any[];
          logger.info(`[WORKER] Found ${items.length} cards matching trend threshold for AI Insights.`);

          // Dynamically import Notification and Sportradar modules
          const { NotificationRepository } = await import("./modules/notification/notification.repository.js");
          const { sportradarNewsService } = await import("./modules/ai-narrative/sportradar.service.js");
          const notifRepository = new NotificationRepository();

          // Sync news for unique sports present in candidate items (Delta sync)
          const uniqueSports = Array.from(new Set(items.map((i) => i.sport || "nfl")));
          for (const sp of uniqueSports) {
            try {
              await sportradarNewsService.syncNewsForSport(sp);
            } catch (syncErr: any) {
              logger.warn(`[WORKER] Failed news sync for ${sp}: ${syncErr.message}`);
            }
          }

          let generatedCount = 0;
          for (const item of items) {
            // Check if player already has a narrative in the last 24 hours
            const existing = await db.execute(sql`
              SELECT id FROM narratives 
              WHERE player_name = ${item.player_name} 
                AND created_at > now() - interval '24 hours'
              LIMIT 1
            `);

            if (existing.rows.length > 0) {
              logger.info(`[WORKER] Narrative for ${item.player_name} already generated in the last 24h. Skipping.`);
              continue;
            }

            // Calculate price range
            const currentPrice = Number(item.price);
            const changePct = Number(item.change);
            const oldPrice = currentPrice / (1 + (changePct / 100));
            const priceRange = changePct >= 0 
              ? `$${oldPrice.toFixed(0)} → $${currentPrice.toFixed(0)}`
              : `$${oldPrice.toFixed(0)} → $${currentPrice.toFixed(0)}`; // e.g. "$100 -> $80" if changePct negative

            // Fetch recent news articles for this player
            const recentArticles = await sportradarNewsService.getNewsForPlayer(item.player_name, item.sport, 5);
            const newsPromptBlock = sportradarNewsService.formatNewsForPrompt(recentArticles);

            const prompt = `
You are an expert sports card market analyst. Analyze the following sports card pricing data alongside real-world news events:
Player: ${item.player_name}
Sport: ${item.sport}
Card: ${item.year} ${item.set_name} (${item.variant_name}) Grade: ${item.grade_key}
Current Comp Price: $${currentPrice.toFixed(2)}
30-Day Price Trend: ${changePct > 0 ? '+' : ''}${changePct.toFixed(1)}%
Price Range: ${priceRange}

Recent Real-World News & Events (Sportradar AP News):
${newsPromptBlock}

Based on this trend and the real-world news events above, write a market insight. Explain the exact catalyst (injury, trade, playoff performance, award, or market overreaction) driving this price shift.
Ensure your response is valid JSON matching this schema:
{
  "headline": "A short, punchy headline (e.g., 'Daniels rookies surge 18% after record game')",
  "shortSummary": "A single sentence summary outlining what dealers should do (max 150 chars)",
  "body": "A detailed explanation of the card's momentum, citing real-world news events if applicable and explaining why the price shifted.",
  "recommendation": "BUY" | "SELL" | "HOLD" | "PRICE ADJUST",
  "narrativeType": "breakout" | "injury" | "hype" | "decline" | "seasonal" | "trade" | "hof" | "award" | "auction_record"
}
Output ONLY the JSON object, do not add markdown block wrappers like \`\`\`json.
`;

            try {
              const res = await vertexAiClient.generateFromText(prompt, "gemini-3.1-flash-lite");
              const cleaned = res.replace(/```json|```/g, "").replace(/`/g, "").trim();
              const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
              const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
              
              const correlatedEventsJson = recentArticles.length > 0
                ? JSON.stringify(recentArticles.map(a => ({ event: a.title, publishedAt: a.published_at, isInjury: a.is_injury, isTransaction: a.is_transaction })))
                : null;

              // Insert narrative into DB
              const [inserted] = await db.insert(narratives).values({
                playerName: item.player_name,
                sport: item.sport,
                cardIds: [item.card_id],
                headline: parsed.headline,
                shortSummary: parsed.shortSummary,
                body: parsed.body,
                narrativeType: parsed.narrativeType,
                priceChangePct: changePct.toFixed(2),
                priceDirection: changePct >= 0 ? "up" : "down",
                priceRange: priceRange,
                recommendation: parsed.recommendation,
                correlatedEvents: correlatedEventsJson,
                status: "published", // Automatically publish cron insights
                publishedAt: new Date()
              }).returning();

              logger.info(`[WORKER] Successfully generated AI Insight for ${item.player_name}. Finding owners to notify...`);

              // Find users who own this card variant in active inventory
              const ownersResult = await db.execute(sql`
                SELECT DISTINCT user_id FROM inventory
                WHERE variant_id = ${item.variant_id} AND listing_status IN ('unlisted', 'listed')
                ${userId ? sql`AND user_id = ${userId}` : sql``}
              `);
              
              const owners = ownersResult.rows as any[];
              for (const owner of owners) {
                await notifRepository.sendNotification(
                  owner.user_id,
                  `AI Insight: ${parsed.headline}`,
                  parsed.shortSummary,
                  "ai_narrative",
                  { screen: "ai-insights", id: inserted.id }
                );
              }

              generatedCount++;

              // Wait 2 seconds between calls to avoid API rate limit
              await delay(2000);
            } catch (err: any) {
              logger.error(`[WORKER] Failed to generate/insert narrative for ${item.player_name}: ${err.message}`);
            }
          }

          return { success: true, generated: generatedCount };
        } catch (error: any) {
          logger.error(`[WORKER] Failed to process generate_ai_insights: ${error.message}`);
          throw error;
        }
      }
      */

      // -------------------------------------------------------------
      // NEW BATCH JOBS
      // -------------------------------------------------------------
      else if (job.name === "process_batch_upload" || job.name === "process_multi_scan") {
        const { batchId, userId } = job.data;
        logger.info(`[WORKER] Processing batch job ${batchId} for user ${userId} (${job.name})`);

        try {
          await db.update(batchJobs).set({ status: "processing", updatedAt: new Date() }).where(eq(batchJobs.id, batchId));
          const [batchRecord] = await db.select().from(batchJobs).where(eq(batchJobs.id, batchId));

          if (userId) {
            await sseService.publish(userId, { type: "batch_status", batchId, status: "processing", message: "Task is in progress..." });
          }

          let cards: any[] = [];
          
          const parseGeminiResponse = (text: string) => {
            let cleaned = text.replace(/```json|```/g, "").trim();
            try {
              return JSON.parse(cleaned);
            } catch (err) {
              const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
              if (jsonMatch) {
                try {
                  return JSON.parse(jsonMatch[0]);
                } catch (e2) {}
              }
              const objMatch = cleaned.match(/\{[\s\S]*\}/);
              if (objMatch) {
                try {
                  const obj = JSON.parse(objMatch[0]);
                  if (obj.cards && Array.isArray(obj.cards)) return obj.cards;
                  return [obj];
                } catch (e3) {}
              }
              logger.error(`[WORKER] Failed to parse JSON. Raw response: ${text}`);
              throw err;
            }
          };
          
          let uploadedImageUrl: string | null = null;
          if (batchRecord.imageBase64 && env.S3_BUCKET_NAME) {
            try {
              const buffer = Buffer.from(batchRecord.imageBase64, "base64");
              const key = `cardimages/${userId || "batch"}/batch-${batchId}/${randomUUID()}.jpg`;
              const client = new S3Client({
                region: env.AWS_REGION || "us-east-1",
                credentials: {
                  accessKeyId: env.AWS_ACCESS_KEY_ID || "",
                  secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "",
                },
              });
              await client.send(
                new PutObjectCommand({
                  Bucket: env.S3_BUCKET_NAME,
                  Key: key,
                  Body: buffer,
                  ContentType: "image/jpeg",
                })
              );
              uploadedImageUrl = `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;
              logger.info(`[WORKER] Uploaded batch image to S3: ${uploadedImageUrl}`);
            } catch (s3Err: any) {
              logger.error(`[WORKER] Failed to upload batch image to S3: ${s3Err.message}`);
            }
          }

          if (job.name === "process_batch_upload") {
            const rawText = batchRecord.rawText || "";
            const prompt = TEXT_EXTRACTION_PROMPT + "\n\n" + rawText;
            const res = await vertexAiClient.generateFromText(prompt, "gemini-3.1-flash-lite");
            const parsed = parseGeminiResponse(res);
            if (Array.isArray(parsed)) cards = parsed;
          } else {
            const imageBase64 = batchRecord.imageBase64;
            if (!imageBase64) throw new Error("No imageBase64 in batch record");
            const res = await vertexAiClient.generateFromImage(MULTI_CARD_SCAN_PROMPT, imageBase64, "image/jpeg", "gemini-3.1-flash-lite");
            const parsed = parseGeminiResponse(res);
            if (Array.isArray(parsed)) cards = parsed;
          }

          logger.info(`[WORKER] Extracted ${cards.length} potential cards for batch ${batchId}. Filtering out invalids...`);
          
          if (userId) {
            await sseService.publish(userId, { type: "batch_status", batchId, status: "progress", message: `Extracted ${cards.length} cards, pre-fetching comps...` });
          }

          // Filter out hallucinated or empty cards
          const validCards = cards.filter((c: any) => c.player_name && c.player_name.trim().length > 0);

          logger.info(`[WORKER] Valid cards: ${validCards.length}. Pre-fetching comps...`);

          if (validCards.length === 0) {
            throw new Error("No cards identified in image or file");
          }

          logger.info(`[AI_CARD_SCAN] 🤖 Extracted Card Details from Batch Scan: ${JSON.stringify(validCards)}`);

          const enrichedCards = [];
          for (const card of validCards) {
            const fetchParams = buildCompsFetchParams({
              player_name: card.player_name,
              year: card.year,
              set_name: card.set_name,
              variation: card.variation,
              card_number: card.card_number,
              grade_key: "RAW",
              search_string: card.search_string,
            }, 20);
            
            let compsData = null;
            try {
              compsData = await listingRepo.ebaySold(fetchParams, ebayService, soldCompsService);
            } catch (err: any) {
              logger.error(`[WORKER] Error pre-fetching comps for ${fetchParams.q}: ${err.message}`);
            }

            enrichedCards.push({
              ...card,
              id: generateCardId(card),
              gradeKey: fetchParams.grade_key,
              comps: compsData,
              uploadedImageUrl: uploadedImageUrl
            });

            // Delay between fetching each card's comps to avoid Vertex AI / eBay API rate limits
            if (cards.length > 1) {
              await delay(2000);
            }
          }

          await db.update(batchJobs).set({ 
            status: "completed", 
            resultsJson: enrichedCards,
            updatedAt: new Date() 
          }).where(eq(batchJobs.id, batchId));
          
          logger.info(`[WORKER] Completed batch job ${batchId}`);
          
          if (userId) {
            const notifRepo = new NotificationRepository();
            const notifService = new NotificationService(notifRepo);
            await notifService.sendNotification(userId, "Upload Complete", `Successfully processed ${cards.length} cards.`, "system", { batchId });
            await sseService.publish(userId, { type: "batch_status", batchId, status: "completed", message: "Task completed successfully" });
          }
          
          return { success: true, count: cards.length };

        } catch (error: any) {
          logger.error(`[WORKER] Failed batch job ${batchId}: ${error.message}`);
          await db.update(batchJobs).set({ 
            status: "failed", 
            error: error.message,
            updatedAt: new Date() 
          }).where(eq(batchJobs.id, batchId));
          
          if (userId) {
            const notifRepo = new NotificationRepository();
            const notifService = new NotificationService(notifRepo);
            await notifService.sendNotification(userId, "Upload Failed", `Task failed: ${error.message}`, "system", { batchId });
            await sseService.publish(userId, { type: "batch_status", batchId, status: "failed", message: error.message });
          }
          
          throw error;
        }
      }
    },
    {
      connection: redisAdapter.getClient(),
      concurrency: 1, 
    }
  );

  worker.on("completed", (job) => {
    logger.info(`👷 Job ${job.id} (${job.name}) has completed successfully`);
  });

  worker.on("failed", (job, err) => {
    logger.error(`👷 Job ${job?.id} (${job?.name}) has failed with error: ${err.message}`);
  });

  return worker;
};
