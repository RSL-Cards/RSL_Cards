// Repository layer

export async function getNotifications(_body: any, _params: any, _query: any) {
  return { message: `Get in-app notifications (unread first, paginated)` };
}

export async function patchNotificationsIdRead(_body: any, _params: any, _query: any) {
  return { message: `Mark single notification as read` };
}

export async function patchNotificationsReadAll(_body: any, _params: any, _query: any) {
  return { message: `Mark all notifications as read` };
}

export async function getNotificationsUnreadCount(_body: any, _params: any, _query: any) {
  return { message: `Get count of unread notifications (badge)` };
}

export async function getShows(_body: any, _params: any, _query: any) {
  return { message: `List upcoming card shows. Query: lat, lng, radius, dateFrom` };
}

export async function getShowsId(_body: any, _params: any, _query: any) {
  return { message: `Show detail with dealers attending + want list matches` };
}

export async function postShowsIdAttend(_body: any, _params: any, _query: any) {
  return { message: `Mark attending a card show (consumer or dealer)` };
}

export async function deleteShowsIdAttend(_body: any, _params: any, _query: any) {
  return { message: `Remove attendance from card show` };
}

export async function getShowsIdDealers(_body: any, _params: any, _query: any) {
  return { message: `Dealers attending this show with public inventory` };
}

export async function postShowsAdmin(_body: any, _params: any, _query: any) {
  return { message: `Create new card show listing` };
}

export async function patchShowsAdminId(_body: any, _params: any, _query: any) {
  return { message: `Update card show details` };
}

export async function deleteShowsAdminId(_body: any, _params: any, _query: any) {
  return { message: `Remove card show` };
}

