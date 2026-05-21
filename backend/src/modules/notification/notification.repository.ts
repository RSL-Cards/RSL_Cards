import { sql } from "drizzle-orm";
import { db } from "../../db/index.js";

export class NotificationRepository {
  async getNotifications(userId: string) {
    return { message: `Get notifications for ${userId}` };
  }

  async getUnreadCount(userId: string) {
    return { count: 0 };
  }

  async markAllAsRead(userId: string) {
    return { success: true };
  }

  async markAsRead(userId: string, id: string) {
    return { success: true };
  }

  async getShows() {
    return { message: `List upcoming card shows` };
  }

  async getShowDetail(id: string) {
    return { message: `Show details for ${id}` };
  }

  async attendShow(userId: string, id: string) {
    return { success: true };
  }

  async leaveShow(userId: string, id: string) {
    return { success: true };
  }

  async getShowDealers(id: string) {
    return { message: `Dealers attending show ${id}` };
  }

  async adminCreateShow(body: any) {
    return { success: true };
  }

  async adminUpdateShow(id: string, body: any) {
    return { success: true };
  }

  async adminDeleteShow(id: string) {
    return { success: true };
  }
}
