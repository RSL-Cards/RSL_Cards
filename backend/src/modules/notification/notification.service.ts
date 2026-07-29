import { NotificationRepository } from "./notification.repository.js";
import { sseService } from "./sse.service.js";

export class NotificationService {
  constructor(private readonly repository: NotificationRepository) {}

  async registerToken(userId: string, token: string, platform: string, timezone?: string) {
    return this.repository.registerToken(userId, token, platform, timezone);
  }

  async sendNotification(userId: string, title: string, body: string, type: string, data?: any) {
    const notification = await this.repository.sendNotification(userId, title, body, type, data);
    await sseService.publish(userId, notification);
    return notification;
  }

  async getNotifications(userId: string) {
    return this.repository.getNotifications(userId);
  }

  async getUnreadCount(userId: string) {
    return this.repository.getUnreadCount(userId);
  }

  async markAllAsRead(userId: string) {
    return this.repository.markAllAsRead(userId);
  }

  async markAsRead(userId: string, id: string) {
    return this.repository.markAsRead(userId, id);
  }

  async getShows() {
    return this.repository.getShows();
  }

  async getShowDetail(id: string) {
    return this.repository.getShowDetail(id);
  }

  async attendShow(userId: string, id: string) {
    return this.repository.attendShow(userId, id);
  }

  async leaveShow(userId: string, id: string) {
    return this.repository.leaveShow(userId, id);
  }

  async getShowDealers(id: string) {
    return this.repository.getShowDealers(id);
  }

  async adminCreateShow(body: any) {
    return this.repository.adminCreateShow(body);
  }

  async adminUpdateShow(id: string, body: any) {
    return this.repository.adminUpdateShow(id, body);
  }

  async adminDeleteShow(id: string) {
    return this.repository.adminDeleteShow(id);
  }
}
