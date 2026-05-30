import { Elysia } from "elysia";
import { AdminRepository } from "./admin.repository.ts";
import { AdminService } from "./admin.service.ts";
import { AdminController } from "./admin.controller.ts";
import { requireAdmin } from "../../middleware/auth.js";

const repository = new AdminRepository();
const service = new AdminService(repository);
const controller = new AdminController(service);

export const adminModule = new Elysia({ prefix: "/v1/admin" })
  .use(requireAdmin)
  .get("/users", controller.getUsers)
  .get("/users/:id", controller.getUserById)
  .patch("/users/:id/role", controller.patchUserRole)
  .patch("/users/:id/suspend", controller.suspendUser)
  .patch("/users/:id/unsuspend", controller.unsuspendUser)
  .delete("/users/:id", controller.deleteUser)
  .get("/narratives/pending", controller.getPendingNarratives)
  .get("/reviews/pending", controller.getPendingReviews)
  .patch("/reviews/:id/approve", controller.approveReview)
  .delete("/reviews/:id", controller.deleteReview)
  .get("/feature-flags", controller.getFeatureFlags)
  .patch("/feature-flags/:key", controller.patchFeatureFlag)
  .get("/audit-logs", controller.getAuditLogs)
  .get("/stats", controller.getStats);
