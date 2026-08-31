import { Elysia } from "elysia";
import { SuperAdminRepository } from "./super-admin.repository.js";
import { SuperAdminService } from "./super-admin.service.js";
import { SuperAdminController } from "./super-admin.controller.js";
import { createSuperAdminRoutes } from "./super-admin.routes.js";
import { requireSuperAdmin } from "../../middleware/auth.js";

const repository = new SuperAdminRepository();
const service = new SuperAdminService(repository);
const controller = new SuperAdminController(service);

export const superAdminModule = new Elysia({ prefix: "/v1/super-admin" })
  .use(requireSuperAdmin)
  .use(createSuperAdminRoutes(controller));
