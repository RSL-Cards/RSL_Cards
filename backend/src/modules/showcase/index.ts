import { Elysia } from "elysia";
import { ShowcaseRepository } from "./showcase.repository.js";
import { ShowcaseService } from "./showcase.service.js";
import { ShowcaseController } from "./showcase.controller.js";

const repository = new ShowcaseRepository();
const service = new ShowcaseService(repository);
const controller = new ShowcaseController(service);

// Note: This router does NOT use the auth middleware because it's public.
export const showcaseModule = new Elysia({ prefix: "/v1/showcase" })
  .get("/:handle", controller.getDealerProfile)
  .get("/:handle/inventory", controller.getDealerInventory);
