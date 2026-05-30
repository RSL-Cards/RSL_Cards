import { Elysia } from "elysia";
import { UserRepository } from "./user.repository.js";
import { UserService } from "./user.service.js";
import { UserController } from "./user.controller.js";
import { EbayOauthService } from "./ebay.oauth.service.js";
import { env } from "../../config/index.js";

const repository = new UserRepository();
const ebayOauthService = new EbayOauthService(env);
const service = new UserService(repository, ebayOauthService);
const controller = new UserController(service);

export const userModule = new Elysia({ prefix: "/v1/users" })
  .get("/me", controller.getMe)
  .patch("/me", controller.patchMe)
  .post("/me/avatar", controller.postMeAvatar)
  .post("/me/onboarding", controller.onboarding)
  .get("/me/payment-methods", controller.getPaymentMethods)
  .post("/me/payment-methods", controller.postPaymentMethod)
  .patch("/me/payment-methods/:id", controller.patchPaymentMethod)
  .delete("/me/payment-methods/:id", controller.deletePaymentMethod)
  .get("/me/connected-platforms", controller.getConnectedPlatforms)
  .post("/me/connected-platforms", controller.postConnectedPlatform)
  .delete("/me/connected-platforms/:platform", controller.deleteConnectedPlatform)
  .get("/ebay/callback", controller.ebayCallback)
  .get("/me/notification-preferences", controller.getNotificationPreferences)
  .patch("/me/notification-preferences", controller.patchNotificationPreferences)
  .get("/dealers", controller.listDealers)
  .get("/dealers/:customUrl", controller.getDealerByUrl)
  .get("/me/customers", controller.getCustomers)
  .post("/me/customers", controller.postCustomer)
  .patch("/me/customers/:id", controller.patchCustomer)
  .delete("/me/customers/:id", controller.deleteCustomer)
  .post("/me/export", controller.exportData)
  .delete("/me", controller.deleteMe);
