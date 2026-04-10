// Repository layer

export async function getNotifications(body: any, params: any, query: any) {
  return { message: `Get in-app notifications (unread first, paginated)` };
}

export async function patchNotificationsIdRead(body: any, params: any, query: any) {
  return { message: `Mark single notification as read` };
}

export async function patchNotificationsReadAll(body: any, params: any, query: any) {
  return { message: `Mark all notifications as read` };
}

export async function getNotificationsUnreadCount(body: any, params: any, query: any) {
  return { message: `Get count of unread notifications (badge)` };
}

export async function getShows(body: any, params: any, query: any) {
  return { message: `List upcoming card shows. Query: lat, lng, radius, dateFrom` };
}

export async function getShowsId(body: any, params: any, query: any) {
  return { message: `Show detail with dealers attending + want list matches` };
}

export async function postShowsIdAttend(body: any, params: any, query: any) {
  return { message: `Mark attending a card show (consumer or dealer)` };
}

export async function deleteShowsIdAttend(body: any, params: any, query: any) {
  return { message: `Remove attendance from card show` };
}

export async function getShowsIdDealers(body: any, params: any, query: any) {
  return { message: `Dealers attending this show with public inventory` };
}

export async function postShowsAdmin(body: any, params: any, query: any) {
  return { message: `Create new card show listing` };
}

export async function patchShowsAdminId(body: any, params: any, query: any) {
  return { message: `Update card show details` };
}

export async function deleteShowsAdminId(body: any, params: any, query: any) {
  return { message: `Remove card show` };
}

