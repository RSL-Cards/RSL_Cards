import * as repository from '../repositories/main.repository.js';

export async function getAdminUsers(body: any, params: any, query: any) {
  // List all users with role, status, join date, stats
  return repository.getAdminUsers(body, params, query);
}

export async function getAdminUsersId(body: any, params: any, query: any) {
  // Full user detail for admin
  return repository.getAdminUsersId(body, params, query);
}

export async function patchAdminUsersIdRole(body: any, params: any, query: any) {
  // Change user role (promote to admin etc)
  return repository.patchAdminUsersIdRole(body, params, query);
}

export async function patchAdminUsersIdSuspend(body: any, params: any, query: any) {
  // Suspend user account
  return repository.patchAdminUsersIdSuspend(body, params, query);
}

export async function patchAdminUsersIdUnsuspend(body: any, params: any, query: any) {
  // Restore suspended account
  return repository.patchAdminUsersIdUnsuspend(body, params, query);
}

export async function deleteAdminUsersId(body: any, params: any, query: any) {
  // Permanently delete user and all data
  return repository.deleteAdminUsersId(body, params, query);
}

export async function getAdminNarrativesPending(body: any, params: any, query: any) {
  // Narratives pending admin review queue
  return repository.getAdminNarrativesPending(body, params, query);
}

export async function getAdminFeatureFlags(body: any, params: any, query: any) {
  // Get all feature flags and current values
  return repository.getAdminFeatureFlags(body, params, query);
}

export async function patchAdminFeatureFlagsKey(body: any, params: any, query: any) {
  // Toggle a feature flag on or off
  return repository.patchAdminFeatureFlagsKey(body, params, query);
}

export async function getAdminReviewsPending(body: any, params: any, query: any) {
  // Dealer reviews pending approval
  return repository.getAdminReviewsPending(body, params, query);
}

export async function patchAdminReviewsIdApprove(body: any, params: any, query: any) {
  // Approve dealer review for public display
  return repository.patchAdminReviewsIdApprove(body, params, query);
}

export async function deleteAdminReviewsId(body: any, params: any, query: any) {
  // Remove inappropriate review
  return repository.deleteAdminReviewsId(body, params, query);
}

export async function getAdminAuditLogs(body: any, params: any, query: any) {
  // System audit log. Query: userId, action, dateFrom
  return repository.getAdminAuditLogs(body, params, query);
}

export async function getAdminStats(body: any, params: any, query: any) {
  // Platform stats: total users, daily active, transactions today
  return repository.getAdminStats(body, params, query);
}

export async function getConfigFeatureFlags(body: any, params: any, query: any) {
  // Public feature flags for mobile app config
  return repository.getConfigFeatureFlags(body, params, query);
}

