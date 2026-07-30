import type { Env } from "../../config/index.js";

export interface SoldCompsItem {
  itemId: string;
  url: string;
  title: string;
  endedAt: string;
  soldPrice: string;
  soldCurrency: string;
  shippingPrice: string | null;
  totalPrice: string;
  sellerUsername: string;
  sellerPositivePercent: number;
  sellerFeedbackScore: number;
  itemCondition?: string;
}

export interface SoldCompsResponse {
  keyword: string;
  totalItems: number;
  hasNextPage: boolean;
  items: SoldCompsItem[];
}

export class SoldCompsService {
  private readonly baseUrl = "https://api.sold-comps.com/v1";

  constructor(private readonly env: Env) {}

  private readonly cache = new Map<string, { data: SoldCompsResponse, timestamp: number }>();
  private readonly inFlight = new Map<string, Promise<SoldCompsResponse>>();

  async getSoldItems(
    keyword: string,
    options?: {
      count?: number;
      page?: number;
      offset?: number;
      ebaySite?: string;
      sortOrder?: string;
      itemCondition?: string;
    }
  ): Promise<SoldCompsResponse> {
    const apiKey = this.env.SOLD_COMPS_KEY;
    if (!apiKey) {
      throw new Error("SOLD_COMPS_KEY is not configured");
    }

    const cacheKey = `${keyword}:${JSON.stringify(options || {})}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 3600000) {
      return cached.data;
    }

    if (this.inFlight.has(cacheKey)) {
      return this.inFlight.get(cacheKey)!;
    }

    const promise = (async () => {
      const url = new URL(`${this.baseUrl}/scrape`);
      url.searchParams.set("keyword", keyword);
      url.searchParams.set("count", String(options?.count ?? 240));
      if (options?.page) {
        url.searchParams.set("page", String(options.page));
      }
      if (options?.offset) {
        url.searchParams.set("offset", String(options.offset));
      }
      url.searchParams.set("ebaySite", options?.ebaySite ?? "ebay.com");
      url.searchParams.set("sortOrder", options?.sortOrder ?? "endedRecently");
      url.searchParams.set("itemCondition", options?.itemCondition ?? "any");

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`SoldComps API failed (${res.status}): ${text}`);
      }

      const data = (await res.json()) as SoldCompsResponse;
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    })().finally(() => {
      this.inFlight.delete(cacheKey);
    });

    this.inFlight.set(cacheKey, promise);
    return promise;
  }

  /**
   * Fetches pages for a keyword query up to maxPages (default: 10 pages).
   * Supports incremental/delta fetching using `minSoldAt`: stops fetching as soon
   * as an item's sold date is <= minSoldAt (previously stored in DB).
   */
  async getAllPagesSoldItems(
    keyword: string,
    options?: {
      countPerPage?: number;
      maxPages?: number;
      minSoldAt?: Date | string | null;
      ebaySite?: string;
      sortOrder?: string;
      itemCondition?: string;
    }
  ): Promise<SoldCompsResponse> {
    const maxPages = options?.maxPages ?? 10;
    const count = options?.countPerPage ?? 240;
    const minTimestamp = options?.minSoldAt ? new Date(options.minSoldAt).getTime() : null;

    let currentPage = 1;
    let accumulatedItems: SoldCompsItem[] = [];
    const seenIds = new Set<string>();

    let firstPageResponse: SoldCompsResponse | null = null;
    let hasNextPage = true;
    let reachedAlreadyFetchedPoint = false;

    while (hasNextPage && currentPage <= maxPages && !reachedAlreadyFetchedPoint) {
      try {
        const resp = await this.getSoldItems(keyword, {
          count,
          page: currentPage,
          ebaySite: options?.ebaySite,
          sortOrder: options?.sortOrder ?? "endedRecently",
          itemCondition: options?.itemCondition,
        });

        if (!firstPageResponse) {
          firstPageResponse = resp;
        }

        const newItems = resp.items || [];
        if (newItems.length === 0) {
          break;
        }

        let addedCount = 0;
        for (const item of newItems) {
          if (minTimestamp && item.endedAt) {
            const itemTime = new Date(item.endedAt).getTime();
            // If item was sold at or before minSoldAt (our latest DB record timestamp), stop fetching!
            if (itemTime <= minTimestamp) {
              console.log(
                `[SoldCompsService] ⏱️ Reached previously stored sold record (${item.endedAt} <= ${options?.minSoldAt}). Stopping delta fetch on page ${currentPage}.`
              );
              reachedAlreadyFetchedPoint = true;
              break;
            }
          }

          const key = item.itemId || item.url || `${item.title}:${item.endedAt}`;
          if (!seenIds.has(key)) {
            seenIds.add(key);
            accumulatedItems.push(item);
            addedCount++;
          }
        }

        hasNextPage = resp.hasNextPage && addedCount > 0 && accumulatedItems.length < resp.totalItems;
        currentPage++;
      } catch (err: any) {
        console.warn(`[SoldCompsService] Page ${currentPage} fetch failed: ${err.message}`);
        break;
      }
    }

    return {
      keyword,
      totalItems: firstPageResponse?.totalItems || accumulatedItems.length,
      hasNextPage: false,
      items: accumulatedItems,
    };
  }
}
