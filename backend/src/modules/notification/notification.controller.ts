import { NotificationService } from "./notification.service.js";
import { sseEmitter } from "./sse.service.js";
import { verifyToken } from "../../lib/jwt.js";
import { env } from "../../config/index.js";

export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  private getUserId(request: Request): string {
    const headerUserId = request.headers.get("x-user-id");
    if (headerUserId) return headerUserId;

    try {
      const url = new URL(request.url);
      const token = url.searchParams.get("token");
      if (token) {
        const payload = verifyToken(token, env);
        if (payload && payload.userId) return payload.userId;
      }
    } catch (e) {}

    return "guest";
  }

  streamNotifications = ({ request }: { request: Request }) => {
    const userId = this.getUserId(request);
    if (userId === "guest") {
      throw new Error("Authentication is required for SSE");
    }

    const stream = new ReadableStream({
      start(controller) {
        const listener = (data: any) => {
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        };

        sseEmitter.on(`notification:${userId}`, listener);

        request.signal.addEventListener("abort", () => {
          sseEmitter.off(`notification:${userId}`, listener);
          try { controller.close(); } catch(e) {}
        });
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  };

  registerToken = async ({ request }: { request: Request }) => {
    const userId = this.getUserId(request);
    if (userId === "guest") {
      throw new Error("Authentication is required");
    }
    const { token, platform } = (await request.json()) as { token?: string; platform?: string };
    if (!token || !platform) {
      throw new Error("Missing token or platform");
    }
    return await this.service.registerToken(userId, token, platform);
  };

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
