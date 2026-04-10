import { FastifyInstance } from 'fastify';
import * as controller from '../controllers/main.controller.js';

export async function registerRoutes(app: FastifyInstance, _env: any) {
  app.get('/v1/inventory', controller.getInventory);
  app.get('/v1/inventory/summary', controller.getInventorySummary);
  app.get('/v1/inventory/aging-alerts', controller.getInventoryAgingAlerts);
  app.get('/v1/inventory/:id', controller.getInventoryId);
  app.post('/v1/inventory', controller.postInventory);
  app.patch('/v1/inventory/:id', controller.patchInventoryId);
  app.delete('/v1/inventory/:id', controller.deleteInventoryId);
  app.post('/v1/inventory/revalue', controller.postInventoryRevalue);
  app.post('/v1/inventory/:id/photos', controller.postInventoryIdPhotos);
  app.delete('/v1/inventory/:id/photos/:photoIndex', controller.deleteInventoryIdPhotosPhotoindex);
  app.post('/v1/inventory/bulk-import', controller.postInventoryBulkImport);
  app.get('/v1/inventory/bulk-import/:jobId', controller.getInventoryBulkImportJobid);
  app.get('/v1/inventory/export', controller.getInventoryExport);
  app.get('/v1/inventory/public/:dealerId', controller.getInventoryPublicDealerid);
}
