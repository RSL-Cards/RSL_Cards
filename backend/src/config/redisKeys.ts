/**
 * Centralized Constants for Redis Keys, Prefixes, Versioning, and BullMQ Queues/Jobs
 */

export const REDIS_CONFIG = {
  VERSION: "v1.0.0",
  KEY_PREFIX: "rsl-cards",
} as const;

export const REDIS_KEYS = {
  /**
   * Generates Redis key for Password Reset OTP
   * Format: rsl-cards:v1:otp:<email>
   */
  otp: (email: string) => `rsl-cards:v1:otp:${email.toLowerCase().trim()}`,

  /**
   * Generates Redis key for User Inventory Summary Cache
   * Format: cache:inventory_summary:<userId>
   */
  inventorySummary: (userId: string) => `cache:inventory_summary:${userId}`,
} as const;

export const BULLMQ_CONFIG = {
  QUEUE_NAME: "rsl-task-queue",
  JOBS: {
    REFRESH_ALL_COMPS: "refresh_all_comps",
    REFRESH_SINGLE_COMP: "refresh_single_comp",
    CHECK_PRICE_SPIKES: "check_price_spikes",
    PROCESS_BATCH_UPLOAD: "process_batch_upload",
    PROCESS_MULTI_SCAN: "process_multi_scan",
    CHECK_INVENTORY_AGING: "check_inventory_aging",
    NOTIFY_CLOSE_DAILY_LOGS: "notify_close_daily_logs",
    SEND_WEEKLY_PERFORMANCE_REPORT: "send_weekly_performance_report",
    GENERATE_AI_INSIGHTS: "generate_ai_insights",
  },
} as const;
