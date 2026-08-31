import { Elysia } from "elysia";
import { SuperAdminController } from "./super-admin.controller.js";

export function createSuperAdminRoutes(controller: SuperAdminController) {
  return new Elysia()
    .get("/dashboard", controller.getDashboard)
    .get("/users/metrics", controller.getUsersMetrics)
    .get("/users/list", controller.getUsersList)
    .get("/cards/dashboard", controller.getCardsMetrics)
    .get("/cards/inventory", controller.getCardsInventory)
    .get("/users", controller.getUsers)
    .get("/dealers", controller.getDealers)
    .get("/cards", controller.getCards)
    .get("/settings", controller.getSettings);
}
