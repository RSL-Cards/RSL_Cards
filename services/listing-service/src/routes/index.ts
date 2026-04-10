import { FastifyInstance } from 'fastify';
import * as controller from '../controllers/main.controller.js';

export async function registerRoutes(app: FastifyInstance, env: any) {
  app.get('/v1/listings', controller.getListings);
  app.post('/v1/listings', controller.postListings);
  app.get('/v1/listings/:id', controller.getListingsId);
  app.patch('/v1/listings/:id/price', controller.patchListingsIdPrice);
  app.delete('/v1/listings/:id', controller.deleteListingsId);
  app.post('/v1/listings/:id/relist', controller.postListingsIdRelist);
  app.get('/v1/listings/price-comparison/:inventoryId', controller.getListingsPriceComparisonInventoryid);
  app.get('/v1/listings/fee-calculator', controller.getListingsFeeCalculator);
  app.post('/v1/listings/generate-content', controller.postListingsGenerateContent);
  app.post('/v1/listings/webhooks/ebay', controller.postListingsWebhooksEbay);
  app.post('/v1/listings/webhooks/whatnot', controller.postListingsWebhooksWhatnot);
  app.post('/v1/listings/webhooks/mercari', controller.postListingsWebhooksMercari);
  app.post('/v1/listings/webhooks/tcgplayer', controller.postListingsWebhooksTcgplayer);
  app.post('/v1/listings/webhooks/shopify', controller.postListingsWebhooksShopify);
  app.get('/v1/listings/analytics', controller.getListingsAnalytics);
}
