import * as repository from '../repositories/main.repository.js';

export async function getNotifications(body: any, params: any, query: any) {
  // Get in-app notifications (unread first, paginated)
  return repository.getNotifications(body, params, query);
}

export async function patchNotificationsIdRead(body: any, params: any, query: any) {
  // Mark single notification as read
  return repository.patchNotificationsIdRead(body, params, query);
}

export async function patchNotificationsReadAll(body: any, params: any, query: any) {
  // Mark all notifications as read
  return repository.patchNotificationsReadAll(body, params, query);
}

export async function getNotificationsUnreadCount(body: any, params: any, query: any) {
  // Get count of unread notifications (badge)
  return repository.getNotificationsUnreadCount(body, params, query);
}

export async function getShows(body: any, params: any, query: any) {
  // List upcoming card shows. Query: lat, lng, radius, dateFrom
  return repository.getShows(body, params, query);
}

export async function getShowsId(body: any, params: any, query: any) {
  // Show detail with dealers attending + want list matches
  return repository.getShowsId(body, params, query);
}

export async function postShowsIdAttend(body: any, params: any, query: any) {
  // Mark attending a card show (consumer or dealer)
  return repository.postShowsIdAttend(body, params, query);
}

export async function deleteShowsIdAttend(body: any, params: any, query: any) {
  // Remove attendance from card show
  return repository.deleteShowsIdAttend(body, params, query);
}

export async function getShowsIdDealers(body: any, params: any, query: any) {
  // Dealers attending this show with public inventory
  return repository.getShowsIdDealers(body, params, query);
}

export async function postShowsAdmin(body: any, params: any, query: any) {
  // Create new card show listing
  return repository.postShowsAdmin(body, params, query);
}

export async function patchShowsAdminId(body: any, params: any, query: any) {
  // Update card show details
  return repository.patchShowsAdminId(body, params, query);
}

export async function deleteShowsAdminId(body: any, params: any, query: any) {
  // Remove card show
  return repository.deleteShowsAdminId(body, params, query);
}

