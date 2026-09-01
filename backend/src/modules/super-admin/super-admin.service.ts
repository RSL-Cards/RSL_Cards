import { SuperAdminRepository } from "./super-admin.repository.js";

export class SuperAdminService {
  constructor(private readonly repository: SuperAdminRepository) {}

  async getDashboard(refresh = false) {
    return await this.repository.getDashboard(refresh);
  }

  async getUsersMetrics(refresh = false) {
    return await this.repository.getUsersMetrics(refresh);
  }

  async getUsersList(page = 1, limit = 10, search = "") {
    return await this.repository.getUsersList(page, limit, search);
  }

  async getCardsMetrics(refresh = false) {
    return await this.repository.getCardsMetrics(refresh);
  }

  async getCardsInventory(page = 1, limit = 10, search = "") {
    return await this.repository.getCardsInventory(page, limit, search);
  }

  async getDealersMetrics(refresh = false) {
    return await this.repository.getDealersMetrics(refresh);
  }

  async getDealersList(page = 1, limit = 10, search = "") {
    return await this.repository.getDealersList(page, limit, search);
  }

  async getDealerDetail(dealerId: string) {
    return await this.repository.getDealerDetail(dealerId);
  }

  async getDealerInventory(dealerId: string, page = 1, limit = 10, search = "") {
    return await this.repository.getDealerInventory(dealerId, page, limit, search);
  }

  async getDealerSoldCards(dealerId: string, page = 1, limit = 10, search = "") {
    return await this.repository.getDealerSoldCards(dealerId, page, limit, search);
  }

  async getUsers() {
    return await this.repository.getUsers();
  }

  async getDealers() {
    return await this.repository.getDealers();
  }

  async getCards() {
    return await this.repository.getCards();
  }

  async getSettings() {
    return await this.repository.getSettings();
  }
}
