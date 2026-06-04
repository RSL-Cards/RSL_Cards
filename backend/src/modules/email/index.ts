import { Elysia } from "elysia";
import { env } from "../../config/index.js";
import { requireDealer } from "../../middleware/auth.js";
import { EmailController } from "./email.controller.js";
import { EmailService } from "./email.service.js";

export const emailService = new EmailService(env);
const controller = new EmailController(emailService);

export const emailModule = new Elysia({ prefix: "/v1/email" })
  .use(requireDealer)
  .post("/test", controller.sendTestEmail);
