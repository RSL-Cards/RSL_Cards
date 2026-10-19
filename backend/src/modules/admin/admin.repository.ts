import { NotImplementedError } from "../../errors/index.js";
export class AdminRepository {
  async getUsers() { throw new NotImplementedError("Admin user list"); }
  async getUserById(id: string) { throw new NotImplementedError("Admin user details"); }
  async patchUserRole(id: string, body: any) { return { success: true }; }
  async suspendUser(id: string) { return { success: true }; }
  async unsuspendUser(id: string) { return { success: true }; }
  async deleteUser(id: string) { return { success: true }; }
  async getPendingNarratives() { throw new NotImplementedError("Pending narratives"); }
  async getPendingReviews() { throw new NotImplementedError("Pending reviews"); }
  async approveReview(id: string) { return { success: true }; }
  async deleteReview(id: string) { return { success: true }; }
  async getFeatureFlags() { throw new NotImplementedError("Feature flags"); }
  async patchFeatureFlag(key: string, body: any) { return { success: true }; }
  async getAuditLogs() { throw new NotImplementedError("Audit logs"); }
  async getStats() { throw new NotImplementedError("Global stats"); }
}
