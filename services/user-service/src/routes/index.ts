import { FastifyInstance } from "fastify";
import * as controller from "../controllers/main.controller.js";
import { internalAuthPreHandler } from "../middleware/internal-auth.js";
import { updateOnboarding } from "../repositories/main.repository.js";

const withInternalAuth = (env: any) => (req: any, reply: any) =>
  internalAuthPreHandler(env, req, reply);

export async function registerRoutes(app: FastifyInstance, env: any) {
  app.post(
    "/v1/users/me/onboarding",
    {
      preHandler: [withInternalAuth(env)],
    },
    async (request: any, reply: any) => {
      const userId = request.headers["x-user-id"] as string;
      if (!userId)
        return reply.status(400).send({ error: "x-user-id header required" });
      await updateOnboarding(env, userId, request.body);
      return reply.send({ success: true });
    },
  );

  app.get("/v1/users/me", controller.getUsersMe);
  app.patch("/v1/users/me", controller.patchUsersMe);
  app.get(
    "/v1/users/me/payment-methods",
    { preHandler: [withInternalAuth(env)] },
    controller.getUsersMePaymentMethods,
  );
  app.post(
    "/v1/users/me/payment-methods",
    { preHandler: [withInternalAuth(env)] },
    controller.postUsersMePaymentMethods,
  );
  app.patch(
    "/v1/users/me/payment-methods/:id",
    { preHandler: [withInternalAuth(env)] },
    controller.patchUsersMePaymentMethodsId,
  );
  app.delete(
    "/v1/users/me/payment-methods/:id",
    { preHandler: [withInternalAuth(env)] },
    controller.deleteUsersMePaymentMethodsId,
  );
  app.get(
    "/v1/users/me/connected-platforms",
    { preHandler: [withInternalAuth(env)] },
    controller.getUsersMeConnectedPlatforms,
  );
  app.post(
    "/v1/users/me/connected-platforms",
    { preHandler: [withInternalAuth(env)] },
    controller.postUsersMeConnectedPlatforms,
  );
  app.delete(
    "/v1/users/me/connected-platforms/:platform",
    controller.deleteUsersMeConnectedPlatformsPlatform,
  );
  app.get(
    "/v1/users/me/notification-preferences",
    controller.getUsersMeNotificationPreferences,
  );
  app.patch(
    "/v1/users/me/notification-preferences",
    controller.patchUsersMeNotificationPreferences,
  );
  app.get("/v1/users/dealers/:customUrl", controller.getUsersDealersCustomurl);
  app.get("/v1/users/dealers", controller.getUsersDealers);
  app.get("/v1/users/me/customers", controller.getUsersMeCustomers);
  app.post("/v1/users/me/customers", controller.postUsersMeCustomers);
  app.patch("/v1/users/me/customers/:id", controller.patchUsersMeCustomersId);
  app.delete("/v1/users/me/customers/:id", controller.deleteUsersMeCustomersId);
  app.post("/v1/users/me/export", controller.postUsersMeExport);
  app.delete("/v1/users/me", controller.deleteUsersMe);
}
