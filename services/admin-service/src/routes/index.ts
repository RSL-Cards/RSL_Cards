import { FastifyInstance } from 'fastify';
import * as controller from '../controllers/main.controller.js';

export async function registerRoutes(app: FastifyInstance, env: any) {
  app.get('/v1/admin/users', controller.getAdminUsers);
  app.get('/v1/admin/users/:id', controller.getAdminUsersId);
  app.patch('/v1/admin/users/:id/role', controller.patchAdminUsersIdRole);
  app.patch('/v1/admin/users/:id/suspend', controller.patchAdminUsersIdSuspend);
  app.patch('/v1/admin/users/:id/unsuspend', controller.patchAdminUsersIdUnsuspend);
  app.delete('/v1/admin/users/:id', controller.deleteAdminUsersId);
  app.get('/v1/admin/narratives/pending', controller.getAdminNarrativesPending);
  app.get('/v1/admin/feature-flags', controller.getAdminFeatureFlags);
  app.patch('/v1/admin/feature-flags/:key', controller.patchAdminFeatureFlagsKey);
  app.get('/v1/admin/reviews/pending', controller.getAdminReviewsPending);
  app.patch('/v1/admin/reviews/:id/approve', controller.patchAdminReviewsIdApprove);
  app.delete('/v1/admin/reviews/:id', controller.deleteAdminReviewsId);
  app.get('/v1/admin/audit-logs', controller.getAdminAuditLogs);
  app.get('/v1/admin/stats', controller.getAdminStats);
  app.get('/v1/config/feature-flags', controller.getConfigFeatureFlags);
}
