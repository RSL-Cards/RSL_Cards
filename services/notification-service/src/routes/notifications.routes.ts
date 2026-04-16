import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getDb } from "../config/db.js";
import { getRedis } from "../config/redis.js";
import { NotificationRepository } from "../repositories/notification.repository.js";
import { NotificationService } from "../services/notification.service.js";
import { NotificationController } from "../controllers/notification.controller.js";
import { internalAuthPreHandler } from "../middleware/internal-auth.js";

export async function notificationsRoutes(app: FastifyInstance) {
  const env = (app as any).env as Env;

  // Dependency Injection
  const notificationRepository = new NotificationRepository(env);
  const notificationService = new NotificationService(notificationRepository);
  const notificationController = new NotificationController(notificationService);

  // Global internal security check
  app.addHook("preHandler", internalAuthPreHandler);

  // Ping
  app.get("/ping", async (_request, reply) => {
    let db_connected = false;
    try { await getDb(env).execute(sql`SELECT 1`); db_connected = true; } catch { db_connected = false; }
    let redis_connected = false;
    try { redis_connected = (await getRedis(env).ping()) === "PONG"; } catch { redis_connected = false; }
    return reply.send({
      service: "notification-service",
      environment: env.NODE_ENV,
      db_connected,
      redis_connected,
      fcm_configured: Boolean(env.FIREBASE_SERVICE_ACCOUNT && env.FIREBASE_SERVICE_ACCOUNT.length > 0),
      email_configured: Boolean(env.RESEND_API_KEY && env.RESEND_API_KEY.length > 0),
      timestamp: new Date().toISOString(),
    });
  });

  // Notifications CRUD
  app.get("/", notificationController.getNotifications);
  app.get("/unread-count", notificationController.getUnreadCount);
  app.patch("/read-all", notificationController.markAllAsRead);
  app.patch("/:id/read", notificationController.markAsRead);

  // Shows Routing
  app.get("/shows", notificationController.getShows);
  app.get("/shows/:id", notificationController.getShowDetail);
  app.post("/shows/:id/attend", notificationController.attendShow);
  app.delete("/shows/:id/attend", notificationController.leaveShow);
  app.get("/shows/:id/dealers", notificationController.getShowDealers);

  app.post("/shows/admin", notificationController.adminCreateShow);
  app.patch("/shows/admin/:id", notificationController.adminUpdateShow);
  app.delete("/shows/admin/:id", notificationController.adminDeleteShow);
}
