import { Elysia } from "elysia";
import { NotificationRepository } from "./notification.repository.ts";
import { NotificationService } from "./notification.service.ts";
import { NotificationController } from "./notification.controller.ts";

const repository = new NotificationRepository();
const service = new NotificationService(repository);
const controller = new NotificationController(service);

export const notificationModule = new Elysia({ prefix: "/v1/notifications" })
  .get("/", controller.getNotifications)
  .get("/unread-count", controller.getUnreadCount)
  .patch("/read-all", controller.markAllAsRead)
  .patch("/:id/read", controller.markAsRead)
  .get("/shows", controller.getShows)
  .get("/shows/:id", controller.getShowDetail)
  .post("/shows/:id/attend", controller.attendShow)
  .delete("/shows/:id/attend", controller.leaveShow)
  .get("/shows/:id/dealers", controller.getShowDealers)
  .post("/shows/admin", controller.adminCreateShow)
  .patch("/shows/admin/:id", controller.adminUpdateShow)
  .delete("/shows/admin/:id", controller.adminDeleteShow);
