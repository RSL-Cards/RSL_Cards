// Repository layer

export async function postCardsScan(body: any, params: any, query: any) {
  return { message: `Identify card from image via Ximilar. Returns card + comps` };
}

export async function postCardsScanBarcode(body: any, params: any, query: any) {
  return { message: `Identify graded card from PSA/BGS/SGC cert barcode` };
}

export async function getCardsSearch(body: any, params: any, query: any) {
  return { message: `Text search: player, year, set, variation. Returns top matches` };
}

export async function getCardsId(body: any, params: any, query: any) {
  return { message: `Get card details + current comp data` };
}

export async function getCardsIdComps(body: any, params: any, query: any) {
  return { message: `Last 5 eBay sold prices + 30-day average + trend` };
}

export async function getCardsIdPriceHistory(body: any, params: any, query: any) {
  return { message: `30/90/365 day price history for sparkline chart` };
}

export async function getCardsOfflineDb(body: any, params: any, query: any) {
  return { message: `Download compressed offline card DB (top 50K cards)` };
}

export async function getCardsPriceAlerts(body: any, params: any, query: any) {
  return { message: `Get user's price alerts` };
}

export async function postCardsPriceAlerts(body: any, params: any, query: any) {
  return { message: `Create price alert for a card` };
}

export async function deleteCardsPriceAlertsId(body: any, params: any, query: any) {
  return { message: `Delete price alert` };
}

export async function getCardsWantList(body: any, params: any, query: any) {
  return { message: `Get user's want list` };
}

export async function postCardsWantList(body: any, params: any, query: any) {
  return { message: `Add card to want list with max price` };
}

export async function deleteCardsWantListId(body: any, params: any, query: any) {
  return { message: `Remove from want list` };
}

export async function getCardsDealRating(body: any, params: any, query: any) {
  return { message: `Get deal rating (good/fair/overpaying) for price vs comp` };
}

