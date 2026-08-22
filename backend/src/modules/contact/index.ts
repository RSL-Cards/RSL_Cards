import { Elysia } from "elysia";
import { ContactController } from "./contact.controller.js";
import { ContactRepository } from "./contact.repository.js";
import { ContactService } from "./contact.service.js";
import { bullMqAdapter } from "../../adapters/bullmq.adapter.js";
import { BULLMQ_CONFIG } from "../../config/redisKeys.js";

const repository = new ContactRepository();
const service = new ContactService(repository);
const controller = new ContactController(service);

export const contactModule = new Elysia({ prefix: "/v1/contact" })
  .post("/", controller.submit)
  .post("/ticket", controller.submit)
  .post("/trigger-report", async () => {
    await bullMqAdapter.addJob(BULLMQ_CONFIG.JOBS.REFRESH_ALL_COMPS, {});
    return { success: true, message: "Comp refresh job enqueued. Report email will be sent to support@rslcards.com upon completion." };
  });

export const supportModule = new Elysia({ prefix: "/v1/support" })
  .post("/", controller.submit)
  .post("/ticket", controller.submit);
