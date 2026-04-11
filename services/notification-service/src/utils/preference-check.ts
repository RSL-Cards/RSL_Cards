import { CRITICAL_TYPES } from '@rsl/shared-constants';

type NotifType = string;
type NotifChannel = 'push' | 'email' | 'in_app';

interface UserPreferences {
  saleAlerts?: boolean;
  priceAlerts?: boolean;
  aiNarratives?: boolean;
  agingAlerts?: boolean;
  showReminders?: boolean;
  wantListMatches?: boolean;
  weeklyDigest?: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
  dailyLimit: number;
  [key: string]: any;
}

// Declaration placeholders for dependencies 
// Assuming implementation lives natively within the notification-service repositories
declare function getUserPreferences(userId: string): Promise<UserPreferences>;
declare function isQuietHours(start: string, end: string, timezone: string): boolean;
declare function getTodayNotificationCount(userId: string): Promise<number>;

/**
 * Checks whether it is appropriate to send a specific type of notification to a user based on 
 * their personal preferences, active quiet hours, frequency limitations, and notification criticality.
 */
export async function shouldSendNotification(
  userId: string, type: NotifType, channel: NotifChannel
): Promise<boolean> {
  const prefs = await getUserPreferences(userId);
 
  // 1. Check if this notification type is enabled
  if (!prefs[type]) return false;
 
  // 2. Check quiet hours (don't send push during user's configured quiet hours)
  if (channel === 'push' && isQuietHours(prefs.quietHoursStart, prefs.quietHoursEnd, prefs.timezone)) {
    // Queue for delivery after quiet hours end (unless critical)
    if (!CRITICAL_TYPES.includes(type as any)) return false;
  }
 
  // 3. Check frequency limits (max X notifications per day for non-critical)
  if (!CRITICAL_TYPES.includes(type as any)) {
    const todayCount = await getTodayNotificationCount(userId);
    if (todayCount >= prefs.dailyLimit) return false;
  }
 
  return true;
}
