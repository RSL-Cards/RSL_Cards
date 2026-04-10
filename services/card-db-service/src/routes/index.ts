import { FastifyInstance } from 'fastify';
import * as controller from '../controllers/main.controller.js';

export async function registerRoutes(app: FastifyInstance, _env: any) {
  app.post('/v1/cards/scan', controller.postCardsScan);
  app.post('/v1/cards/scan/barcode', controller.postCardsScanBarcode);
  app.get('/v1/cards/search', controller.getCardsSearch);
  app.get('/v1/cards/:id', controller.getCardsId);
  app.get('/v1/cards/:id/comps', controller.getCardsIdComps);
  app.get('/v1/cards/:id/price-history', controller.getCardsIdPriceHistory);
  app.get('/v1/cards/offline-db', controller.getCardsOfflineDb);
  app.get('/v1/cards/price-alerts', controller.getCardsPriceAlerts);
  app.post('/v1/cards/price-alerts', controller.postCardsPriceAlerts);
  app.delete('/v1/cards/price-alerts/:id', controller.deleteCardsPriceAlertsId);
  app.get('/v1/cards/want-list', controller.getCardsWantList);
  app.post('/v1/cards/want-list', controller.postCardsWantList);
  app.delete('/v1/cards/want-list/:id', controller.deleteCardsWantListId);
  app.get('/v1/cards/deal-rating', controller.getCardsDealRating);
}
