
import { NotificationRepository } from "../repositories/notification.repository.js";

export class NotificationService {
  constructor(
    private readonly repository: NotificationRepository
  ) {}

  async getNotifications(body: any, params: any, query: any) {
    return this.repository.getNotifications(body, params, query);
  }

  async markAsRead(body: any, params: any, query: any) {
    return this.repository.markAsRead(body, params, query);
  }

  async markAllAsRead(body: any, params: any, query: any) {
    return this.repository.markAllAsRead(body, params, query);
  }

  async getUnreadCount(body: any, params: any, query: any) {
    return this.repository.getUnreadCount(body, params, query);
  }

  async getShows(body: any, params: any, query: any) {
    return this.repository.getShows(body, params, query);
  }

  async getShowDetail(body: any, params: any, query: any) {
    return this.repository.getShowDetail(body, params, query);
  }

  async attendShow(body: any, params: any, query: any) {
    return this.repository.attendShow(body, params, query);
  }

  async leaveShow(body: any, params: any, query: any) {
    return this.repository.leaveShow(body, params, query);
  }

  async getShowDealers(body: any, params: any, query: any) {
    return this.repository.getShowDealers(body, params, query);
  }

  async adminCreateShow(body: any, params: any, query: any) {
    return this.repository.adminCreateShow(body, params, query);
  }

  async adminUpdateShow(body: any, params: any, query: any) {
    return this.repository.adminUpdateShow(body, params, query);
  }

  async adminDeleteShow(body: any, params: any, query: any) {
    return this.repository.adminDeleteShow(body, params, query);
  }
}
