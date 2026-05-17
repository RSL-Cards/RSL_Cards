import { NotificationService } from "./notification.service.js";

export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  private getUserId(request: Request): string {
    return request.headers.get("x-user-id") || "guest";
  }

  getNotifications = async ({ request }: { request: Request }) => {
    return await this.service.getNotifications(this.getUserId(request));
  };

  getUnreadCount = async ({ request }: { request: Request }) => {
    return await this.service.getUnreadCount(this.getUserId(request));
  };

  markAllAsRead = async ({ request }: { request: Request }) => {
    return await this.service.markAllAsRead(this.getUserId(request));
  };

  markAsRead = async ({ request, params }: { request: Request; params: any }) => {
    return await this.service.markAsRead(this.getUserId(request), params.id);
  };

  getShows = async () => {
    return await this.service.getShows();
  };

  getShowDetail = async ({ params }: { params: any }) => {
    return await this.service.getShowDetail(params.id);
  };

  attendShow = async ({ request, params }: { request: Request; params: any }) => {
    return await this.service.attendShow(this.getUserId(request), params.id);
  };

  leaveShow = async ({ request, params }: { request: Request; params: any }) => {
    return await this.service.leaveShow(this.getUserId(request), params.id);
  };

  getShowDealers = async ({ params }: { params: any }) => {
    return await this.service.getShowDealers(params.id);
  };

  adminCreateShow = async ({ body }: { body: any }) => {
    return await this.service.adminCreateShow(body);
  };

  adminUpdateShow = async ({ params, body }: { params: any; body: any }) => {
    return await this.service.adminUpdateShow(params.id, body);
  };

  adminDeleteShow = async ({ params }: { params: any }) => {
    return await this.service.adminDeleteShow(params.id);
  };
}
