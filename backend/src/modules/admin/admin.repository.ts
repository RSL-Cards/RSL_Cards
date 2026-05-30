export class AdminRepository {
  async getUsers() { return { message: "Get all users" }; }
  async getUserById(id: string) { return { message: `Get user ${id}` }; }
  async patchUserRole(id: string, body: any) { return { success: true }; }
  async suspendUser(id: string) { return { success: true }; }
  async unsuspendUser(id: string) { return { success: true }; }
  async deleteUser(id: string) { return { success: true }; }
  async getPendingNarratives() { return { message: "Pending narratives" }; }
  async getPendingReviews() { return { message: "Pending reviews" }; }
  async approveReview(id: string) { return { success: true }; }
  async deleteReview(id: string) { return { success: true }; }
  async getFeatureFlags() { return { message: "Feature flags" }; }
  async patchFeatureFlag(key: string, body: any) { return { success: true }; }
  async getAuditLogs() { return { message: "Audit logs" }; }
  async getStats() { return { message: "Global stats" }; }
}
