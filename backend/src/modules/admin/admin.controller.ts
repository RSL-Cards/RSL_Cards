import { AdminService } from "./admin.service.js";

export class AdminController {
  constructor(private readonly service: AdminService) {}
  getUsers = async () => { return await this.service.getUsers(); };
  getUserById = async ({ params }: { params: any }) => { return await this.service.getUserById(params.id); };
  patchUserRole = async ({ params, body }: { params: any; body: any }) => { return await this.service.patchUserRole(params.id, body); };
  suspendUser = async ({ params }: { params: any }) => { return await this.service.suspendUser(params.id); };
  unsuspendUser = async ({ params }: { params: any }) => { return await this.service.unsuspendUser(params.id); };
  deleteUser = async ({ params }: { params: any }) => { return await this.service.deleteUser(params.id); };
  getPendingNarratives = async () => { return await this.service.getPendingNarratives(); };
  getPendingReviews = async () => { return await this.service.getPendingReviews(); };
  approveReview = async ({ params }: { params: any }) => { return await this.service.approveReview(params.id); };
  deleteReview = async ({ params }: { params: any }) => { return await this.service.deleteReview(params.id); };
  getFeatureFlags = async () => { return await this.service.getFeatureFlags(); };
  patchFeatureFlag = async ({ params, body }: { params: any; body: any }) => { return await this.service.patchFeatureFlag(params.key, body); };
  getAuditLogs = async () => { return await this.service.getAuditLogs(); };
  getStats = async () => { return await this.service.getStats(); };
}
