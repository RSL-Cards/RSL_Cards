import { AdminRepository } from "./admin.repository.js";

export class AdminService {
  constructor(private readonly repository: AdminRepository) {}
  async getUsers() { return this.repository.getUsers(); }
  async getUserById(id: string) { return this.repository.getUserById(id); }
  async patchUserRole(id: string, body: any) { return this.repository.patchUserRole(id, body); }
  async suspendUser(id: string) { return this.repository.suspendUser(id); }
  async unsuspendUser(id: string) { return this.repository.unsuspendUser(id); }
  async deleteUser(id: string) { return this.repository.deleteUser(id); }
  async getPendingNarratives() { return this.repository.getPendingNarratives(); }
  async getPendingReviews() { return this.repository.getPendingReviews(); }
  async approveReview(id: string) { return this.repository.approveReview(id); }
  async deleteReview(id: string) { return this.repository.deleteReview(id); }
  async getFeatureFlags() { return this.repository.getFeatureFlags(); }
  async patchFeatureFlag(key: string, body: any) { return this.repository.patchFeatureFlag(key, body); }
  async getAuditLogs() { return this.repository.getAuditLogs(); }
  async getStats() { return this.repository.getStats(); }
}
