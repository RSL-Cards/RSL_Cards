import { Elysia } from "elysia";
import { SuperAdminController } from "./super-admin.controller.js";

export function createSuperAdminRoutes(controller: SuperAdminController) {
  return new Elysia()
    .get("/dashboard", controller.getDashboard)
    .get("/users/metrics", controller.getUsersMetrics)
    .get("/users/list", controller.getUsersList)
    .get("/cards/dashboard", controller.getCardsMetrics)
    .get("/cards/inventory", controller.getCardsInventory)
    .get("/dealers/metrics", controller.getDealersMetrics)
    .get("/dealers/list", controller.getDealersList)
    .get("/dealers/:dealerId", controller.getDealerDetail)
    .get("/dealers/:dealerId/inventory", controller.getDealerInventory)
    .get("/dealers/:dealerId/sold", controller.getDealerSoldCards)
    .get("/users", controller.getUsers)
    .get("/dealers", controller.getDealers)
    .get("/cards", controller.getCards)
    .get("/settings", controller.getSettings);
}
