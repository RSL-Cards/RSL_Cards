import * as repository from '../repositories/main.repository.js';

export async function getListings(body: any, params: any, query: any) {
  // All active listings across all platforms
  return repository.getListings(body, params, query);
}

export async function postListings(body: any, params: any, query: any) {
  // Create listing on one or more platforms simultaneously
  return repository.postListings(body, params, query);
}

export async function getListingsId(body: any, params: any, query: any) {
  // Single listing detail with platform status
  return repository.getListingsId(body, params, query);
}

export async function patchListingsIdPrice(body: any, params: any, query: any) {
  // Update price on active listing
  return repository.patchListingsIdPrice(body, params, query);
}

export async function deleteListingsId(body: any, params: any, query: any) {
  // End/remove listing from platform
  return repository.deleteListingsId(body, params, query);
}

export async function postListingsIdRelist(body: any, params: any, query: any) {
  // Relist an ended listing
  return repository.postListingsIdRelist(body, params, query);
}

export async function getListingsPriceComparisonInventoryid(body: any, params: any, query: any) {
  // Get current prices for a card across all platforms
  return repository.getListingsPriceComparisonInventoryid(body, params, query);
}

export async function getListingsFeeCalculator(body: any, params: any, query: any) {
  // Calculate net profit per platform for given price
  return repository.getListingsFeeCalculator(body, params, query);
}

export async function postListingsGenerateContent(body: any, params: any, query: any) {
  // AI-generate title + description for a card listing
  return repository.postListingsGenerateContent(body, params, query);
}

export async function postListingsWebhooksEbay(body: any, params: any, query: any) {
  // eBay sold/offer webhook receiver
  return repository.postListingsWebhooksEbay(body, params, query);
}

export async function postListingsWebhooksWhatnot(body: any, params: any, query: any) {
  // Whatnot sold webhook receiver
  return repository.postListingsWebhooksWhatnot(body, params, query);
}

export async function postListingsWebhooksMercari(body: any, params: any, query: any) {
  // Mercari sold webhook receiver
  return repository.postListingsWebhooksMercari(body, params, query);
}

export async function postListingsWebhooksTcgplayer(body: any, params: any, query: any) {
  // TCGPlayer sold webhook receiver
  return repository.postListingsWebhooksTcgplayer(body, params, query);
}

export async function postListingsWebhooksShopify(body: any, params: any, query: any) {
  // Shopify order webhook receiver
  return repository.postListingsWebhooksShopify(body, params, query);
}

export async function getListingsAnalytics(body: any, params: any, query: any) {
  // Per-platform sales performance, views, watchers
  return repository.getListingsAnalytics(body, params, query);
}

