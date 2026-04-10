import { FastifyInstance } from 'fastify';
import * as controller from '../controllers/main.controller.js';

export async function registerRoutes(app: FastifyInstance, env: any) {
  app.get('/v1/narratives/feed', controller.getNarrativesFeed);
  app.get('/v1/narratives/inventory', controller.getNarrativesInventory);
  app.get('/v1/narratives/:id', controller.getNarrativesId);
  app.get('/v1/narratives/player/:playerName', controller.getNarrativesPlayerPlayername);
  app.get('/v1/narratives/card/:cardId', controller.getNarrativesCardCardid);
  app.get('/v1/narratives/daily-insight', controller.getNarrativesDailyInsight);
  app.get('/v1/narratives/weekly-recap', controller.getNarrativesWeeklyRecap);
  app.post('/v1/narratives/admin/generate', controller.postNarrativesAdminGenerate);
  app.patch('/v1/narratives/admin/:id/approve', controller.patchNarrativesAdminIdApprove);
  app.patch('/v1/narratives/admin/:id/reject', controller.patchNarrativesAdminIdReject);
  app.patch('/v1/narratives/admin/:id', controller.patchNarrativesAdminId);
}
