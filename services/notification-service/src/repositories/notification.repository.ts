
import type { Env } from "../config/env.js";

export class NotificationRepository {
  constructor(private readonly env: Env) {
    void this.env;
  }

  // private get db() {
  //   return getDb(this.env);
  // }

  async getNotifications(_body: any, _params: any, _query: any) {
    return { message: `Get in-app notifications (unread first, paginated)` };
  }

  async markAsRead(_body: any, _params: any, _query: any) {
    return { message: `Mark single notification as read` };
  }

  async markAllAsRead(_body: any, _params: any, _query: any) {
    return { message: `Mark all notifications as read` };
  }

  async getUnreadCount(_body: any, _params: any, _query: any) {
    return { message: `Get count of unread notifications (badge)` };
  }

  async getShows(_body: any, _params: any, _query: any) {
    return { message: `List upcoming card shows. Query: lat, lng, radius, dateFrom` };
  }

  async getShowDetail(_body: any, _params: any, _query: any) {
    return { message: `Show detail with dealers attending + want list matches` };
  }

  async attendShow(_body: any, _params: any, _query: any) {
    return { message: `Mark attending a card show (consumer or dealer)` };
  }

  async leaveShow(_body: any, _params: any, _query: any) {
    return { message: `Remove attendance from card show` };
  }

  async getShowDealers(_body: any, _params: any, _query: any) {
    return { message: `Dealers attending this show with public inventory` };
  }

  async adminCreateShow(_body: any, _params: any, _query: any) {
    return { message: `Create new card show listing` };
  }

  async adminUpdateShow(_body: any, _params: any, _query: any) {
    return { message: `Update card show details` };
  }

  async adminDeleteShow(_body: any, _params: any, _query: any) {
    return { message: `Remove card show` };
  }
}
