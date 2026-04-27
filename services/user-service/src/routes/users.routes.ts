import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import type { Env } from "../config/env.js";
import { getDb } from "../config/db.js";
import { getRedis } from "../config/redis.js";
import { UserRepository } from "../repositories/user.repository.js";
import { UserService } from "../services/user.service.js";
import { UserController } from "../controllers/user.controller.js";
import { internalAuthPreHandler } from "../middleware/internal-auth.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function usersRoutes(app: FastifyInstance) {
  const env = (app as any).env as Env;

  // Dependency Injection
  const userRepository = new UserRepository(env);
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  // Global internal security check
  app.addHook("preHandler", internalAuthPreHandler);

  // Ping/Status
  app.get("/ping", async (_request, reply) => {
    let db_connected = false;
    try {
      await getDb(env).execute(sql`SELECT 1`);
      db_connected = true;
    } catch {
      db_connected = false;
    }
    let redis_connected = false;
    try {
      redis_connected = (await getRedis(env).ping()) === "PONG";
    } catch {
      redis_connected = false;
    }
    return reply.send({
      service: "user-service",
      environment: env.NODE_ENV,
      db_connected,
      redis_connected,
      message: "user-service is running",
      timestamp: new Date().toISOString(),
    });
  });

  // User Profile
  app.get("/me", userController.getMe);
  app.patch("/me", userController.patchMe);

  app.post("/me/avatar", async (req: any, reply) => {
    const userId = req.headers["x-user-id"] as string;
    const { contentType = "image/jpeg" } = (req.body as any) ?? {};

    if (!env.S3_BUCKET_NAME) {
      return reply.status(503).send({ error: "S3 not configured" });
    }

    const ext = contentType === "image/png" ? "png" : "jpg";
    const key = `avatars/${userId}/profile.${ext}`;

    const client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
    const cmd = new PutObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
    });
    const uploadUrl = await getSignedUrl(client, cmd, { expiresIn: 300 });
    const publicUrl = `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

    return reply.send({ uploadUrl, publicUrl, key });
  });
  app.post("/me/onboarding", userController.onboarding);

  // Payment Methods
  app.get("/me/payment-methods", userController.getPaymentMethods);
  app.post("/me/payment-methods", userController.postPaymentMethod);
  app.patch("/me/payment-methods/:id", userController.patchPaymentMethod);
  app.delete("/me/payment-methods/:id", userController.deletePaymentMethod);

  // Platforms
  app.get("/me/connected-platforms", userController.getConnectedPlatforms);
  app.post("/me/connected-platforms", userController.postConnectedPlatform);
  app.delete(
    "/me/connected-platforms/:platform",
    userController.deleteConnectedPlatform,
  );

  // Notifications
  app.get(
    "/me/notification-preferences",
    userController.getNotificationPreferences,
  );
  app.patch(
    "/me/notification-preferences",
    userController.patchNotificationPreferences,
  );

  // Dealers
  app.get("/dealers", userController.listDealers);
  app.get("/dealers/:customUrl", userController.getDealerByUrl);

  // Customers (CRMs)
  app.get("/me/customers", userController.getCustomers);
  app.post("/me/customers", userController.postCustomer);
  app.patch("/me/customers/:id", userController.patchCustomer);
  app.delete("/me/customers/:id", userController.deleteCustomer);

  // Misc
  app.post("/me/export", userController.exportData);
  app.delete("/me", userController.deleteMe);
}
