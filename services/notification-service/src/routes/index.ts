import { FastifyInstance } from 'fastify';
import * as controller from '../controllers/main.controller.js';

export async function registerRoutes(app: FastifyInstance, env: any) {
  app.get('/v1/notifications', controller.getNotifications);
  app.patch('/v1/notifications/:id/read', controller.patchNotificationsIdRead);
  app.patch('/v1/notifications/read-all', controller.patchNotificationsReadAll);
  app.get('/v1/notifications/unread-count', controller.getNotificationsUnreadCount);
  app.get('/v1/shows', controller.getShows);
  app.get('/v1/shows/:id', controller.getShowsId);
  app.post('/v1/shows/:id/attend', controller.postShowsIdAttend);
  app.delete('/v1/shows/:id/attend', controller.deleteShowsIdAttend);
  app.get('/v1/shows/:id/dealers', controller.getShowsIdDealers);
  app.post('/v1/shows/admin', controller.postShowsAdmin);
  app.patch('/v1/shows/admin/:id', controller.patchShowsAdminId);
  app.delete('/v1/shows/admin/:id', controller.deleteShowsAdminId);
}
