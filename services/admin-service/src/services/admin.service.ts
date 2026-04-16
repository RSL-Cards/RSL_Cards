import { AdminRepository } from "../repositories/admin.repository.js";

export class AdminService {
  constructor(
    private readonly repository: AdminRepository
  ) {}

  async getAdminUsers(body: any, params: any, query: any) {
    return this.repository.getAdminUsers(body, params, query);
  }

  async getAdminUsersId(body: any, params: any, query: any) {
    return this.repository.getAdminUsersId(body, params, query);
  }

  async patchAdminUsersIdRole(body: any, params: any, query: any) {
    return this.repository.patchAdminUsersIdRole(body, params, query);
  }

  async patchAdminUsersIdSuspend(body: any, params: any, query: any) {
    return this.repository.patchAdminUsersIdSuspend(body, params, query);
  }

  async patchAdminUsersIdUnsuspend(body: any, params: any, query: any) {
    return this.repository.patchAdminUsersIdUnsuspend(body, params, query);
  }

  async deleteAdminUsersId(body: any, params: any, query: any) {
    return this.repository.deleteAdminUsersId(body, params, query);
  }

  async getAdminNarrativesPending(body: any, params: any, query: any) {
    return this.repository.getAdminNarrativesPending(body, params, query);
  }

  async getAdminFeatureFlags(body: any, params: any, query: any) {
    return this.repository.getAdminFeatureFlags(body, params, query);
  }

  async patchAdminFeatureFlagsKey(body: any, params: any, query: any) {
    return this.repository.patchAdminFeatureFlagsKey(body, params, query);
  }

  async getAdminReviewsPending(body: any, params: any, query: any) {
    return this.repository.getAdminReviewsPending(body, params, query);
  }

  async patchAdminReviewsIdApprove(body: any, params: any, query: any) {
    return this.repository.patchAdminReviewsIdApprove(body, params, query);
  }

  async deleteAdminReviewsId(body: any, params: any, query: any) {
    return this.repository.deleteAdminReviewsId(body, params, query);
  }

  async getAdminAuditLogs(body: any, params: any, query: any) {
    return this.repository.getAdminAuditLogs(body, params, query);
  }

  async getAdminStats(body: any, params: any, query: any) {
    return this.repository.getAdminStats(body, params, query);
  }

  async getConfigFeatureFlags(body: any, params: any, query: any) {
    return this.repository.getConfigFeatureFlags(body, params, query);
  }
}
