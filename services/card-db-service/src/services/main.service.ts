import * as repository from '../repositories/main.repository.js';

export async function postCardsScan(body: any, params: any, query: any) {
  // Identify card from image via Ximilar. Returns card + comps
  return repository.postCardsScan(body, params, query);
}

export async function postCardsScanBarcode(body: any, params: any, query: any) {
  // Identify graded card from PSA/BGS/SGC cert barcode
  return repository.postCardsScanBarcode(body, params, query);
}

export async function getCardsSearch(body: any, params: any, query: any) {
  // Text search: player, year, set, variation. Returns top matches
  return repository.getCardsSearch(body, params, query);
}

export async function getCardsId(body: any, params: any, query: any) {
  // Get card details + current comp data
  return repository.getCardsId(body, params, query);
}

export async function getCardsIdComps(body: any, params: any, query: any) {
  // Last 5 eBay sold prices + 30-day average + trend
  return repository.getCardsIdComps(body, params, query);
}

export async function getCardsIdPriceHistory(body: any, params: any, query: any) {
  // 30/90/365 day price history for sparkline chart
  return repository.getCardsIdPriceHistory(body, params, query);
}

export async function getCardsOfflineDb(body: any, params: any, query: any) {
  // Download compressed offline card DB (top 50K cards)
  return repository.getCardsOfflineDb(body, params, query);
}

export async function getCardsPriceAlerts(body: any, params: any, query: any) {
  // Get user's price alerts
  return repository.getCardsPriceAlerts(body, params, query);
}

export async function postCardsPriceAlerts(body: any, params: any, query: any) {
  // Create price alert for a card
  return repository.postCardsPriceAlerts(body, params, query);
}

export async function deleteCardsPriceAlertsId(body: any, params: any, query: any) {
  // Delete price alert
  return repository.deleteCardsPriceAlertsId(body, params, query);
}

export async function getCardsWantList(body: any, params: any, query: any) {
  // Get user's want list
  return repository.getCardsWantList(body, params, query);
}

export async function postCardsWantList(body: any, params: any, query: any) {
  // Add card to want list with max price
  return repository.postCardsWantList(body, params, query);
}

export async function deleteCardsWantListId(body: any, params: any, query: any) {
  // Remove from want list
  return repository.deleteCardsWantListId(body, params, query);
}

export async function getCardsDealRating(body: any, params: any, query: any) {
  // Get deal rating (good/fair/overpaying) for price vs comp
  return repository.getCardsDealRating(body, params, query);
}

