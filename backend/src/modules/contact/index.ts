import { Elysia } from "elysia";
import { ContactController } from "./contact.controller.js";
import { ContactRepository } from "./contact.repository.js";
import { ContactService } from "./contact.service.js";

const repository = new ContactRepository();
const service = new ContactService(repository);
const controller = new ContactController(service);

export const contactModule = new Elysia({ prefix: "/v1/contact" })
  .post("/", controller.submit)
  .post("/ticket", controller.submit);

export const supportModule = new Elysia({ prefix: "/v1/support" })
  .post("/", controller.submit)
  .post("/ticket", controller.submit);
