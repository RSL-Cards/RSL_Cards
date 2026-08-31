import { SuperAdminService } from "./super-admin.service.js";

export class SuperAdminController {
  constructor(private readonly service: SuperAdminService) {}

  getDashboard = async ({ query }: { query?: { refresh?: string } }) => {
    const refresh = query?.refresh === "true";
    return await this.service.getDashboard(refresh);
  };

  getUsersMetrics = async ({ query }: { query?: { refresh?: string } }) => {
    const refresh = query?.refresh === "true";
    return await this.service.getUsersMetrics(refresh);
  };

  getUsersList = async ({
    query,
  }: {
    query?: { page?: string; limit?: string; search?: string };
  }) => {
    const page = Number(query?.page || 1);
    const limit = Number(query?.limit || 10);
    const search = query?.search || "";
    return await this.service.getUsersList(page, limit, search);
  };

  getCardsMetrics = async ({ query }: { query?: { refresh?: string } }) => {
    const refresh = query?.refresh === "true";
    return await this.service.getCardsMetrics(refresh);
  };

  getCardsInventory = async ({
    query,
  }: {
    query?: { page?: string; limit?: string; search?: string };
  }) => {
    const page = Number(query?.page || 1);
    const limit = Number(query?.limit || 10);
    const search = query?.search || "";
    return await this.service.getCardsInventory(page, limit, search);
  };

  getUsers = async () => {
    return await this.service.getUsers();
  };

  getDealers = async () => {
    return await this.service.getDealers();
  };

  getCards = async () => {
    return await this.service.getCards();
  };

  getSettings = async () => {
    return await this.service.getSettings();
  };
}
