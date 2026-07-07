import { db } from "../../db/index.js";
import { sportradarNewsArticles, sportradarFetchLog } from "../../db/schema/index.js";
import { env } from "../../config/index.js";
import { logger } from "../../lib/logger.js";
import { sql, eq } from "drizzle-orm";

export class SportradarNewsService {
  private getApiKey(): string {
    return env.SPORTRADAR_ASSOCIATED_PRESS || env.SPORTRADAR_API_KEY || "";
  }

  private mapSport(sportInput: string | null | undefined): { sportCode: string; leagueParam?: string } {
    if (!sportInput) return { sportCode: "nfl" };
    const clean = sportInput.toLowerCase().trim();
    if (clean === "football" || clean === "nfl") return { sportCode: "nfl" };
    if (clean === "basketball" || clean === "nba") return { sportCode: "nba" };
    if (clean === "baseball" || clean === "mlb") return { sportCode: "mlb" };
    if (clean === "hockey" || clean === "nhl") return { sportCode: "nhl" };
    if (clean === "soccer") return { sportCode: "soccer", leagueParam: "epl" };
    if (["f1", "golf", "indycar", "nascar", "nbdl", "ncaafb", "ncaamb", "ncaawb", "olympics", "tennis", "wnba"].includes(clean)) {
      return { sportCode: clean };
    }
    return { sportCode: "nfl" }; // default fallback
  }

  /**
   * Performs delta/incremental fetching of news articles for a given sport.
   * Only queries missing dates between lastFetchedDate and today.
   */
  async syncNewsForSport(sportInput: string): Promise<{ fetchedDays: number; totalArticles: number }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      logger.warn("[SPORTRADAR] No API key configured (SPORTRADAR_ASSOCIATED_PRESS or SPORTRADAR_API_KEY). Skipping news sync.");
      return { fetchedDays: 0, totalArticles: 0 };
    }

    const { sportCode, leagueParam } = this.mapSport(sportInput);
    const accessLevel = env.SPORTRADAR_ACCESS_LEVEL || "t3";

    // 1. Check last fetched date in DB log
    const [logEntry] = await db
      .select()
      .from(sportradarFetchLog)
      .where(eq(sportradarFetchLog.sport, sportCode));

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD

    let startDate: Date;
    if (logEntry && logEntry.lastFetchedDate) {
      // If we fetched today already within last 6 hours, we only re-check today
      startDate = new Date(logEntry.lastFetchedDate);
    } else {
      // Default to 7 days ago on first run
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    }

    // Ensure we don't loop indefinitely or fetch into future
    const datesToFetch: string[] = [];
    const curr = new Date(startDate);
    while (curr <= now) {
      datesToFetch.push(curr.toISOString().slice(0, 10));
      curr.setDate(curr.getDate() + 1);
    }

    logger.info(`[SPORTRADAR] Syncing news for sport '${sportCode}' across ${datesToFetch.length} date(s)...`);

    let totalArticles = 0;
    let fetchedDays = 0;

    for (const dateStr of datesToFetch) {
      const [year, month, day] = dateStr.split("-");
      const url = new URL(`https://api.sportradar.com/content-${sportCode}-${accessLevel}/ap//news/${year}/${month}/${day}/all.json`);
      if (leagueParam) {
        url.searchParams.set("league", leagueParam);
      }

      try {
        logger.info(`[SPORTRADAR] Fetching ${url.toString()}`);
        const res = await fetch(url.toString(), {
          headers: {
            "accept": "application/json",
            "x-api-key": apiKey,
          },
        });

        if (!res.ok) {
          if (res.status === 403 || res.status === 401) {
            logger.warn(`[SPORTRADAR] Auth failed (${res.status}) for ${sportCode}. Check API key & access level.`);
            break;
          }
          if (res.status === 429) {
            logger.warn(`[SPORTRADAR] Rate limited (429). Pausing sync for ${sportCode}.`);
            break;
          }
          logger.warn(`[SPORTRADAR] Failed to fetch news for ${dateStr} (${res.status}): ${res.statusText}`);
          continue;
        }

        const data = await res.json() as any;
        const items = data?.items || [];
        logger.info(`[SPORTRADAR] Received ${items.length} articles for ${dateStr}`);

        for (const item of items) {
          if (!item.id || !item.title) continue;

          // Extract player names and entities from refs
          const refs: string[] = [];
          if (Array.isArray(item.refs)) {
            for (const ref of item.refs) {
              if (ref.name) refs.push(ref.name);
            }
          }

          // Also check assets refs if any
          if (item.content?.assets && Array.isArray(item.content.assets)) {
            for (const asset of item.content.assets) {
              if (asset.refs && Array.isArray(asset.refs)) {
                for (const ref of asset.refs) {
                  if (ref.name && !refs.includes(ref.name)) refs.push(ref.name);
                }
              }
            }
          }

          const contentLong = item.content?.long || item.content?.long_html || "";
          const publishedAt = item.created ? new Date(item.created) : new Date();

          await db.insert(sportradarNewsArticles).values({
            id: item.id,
            sport: sportCode,
            title: item.title,
            byline: item.byline || "",
            dateline: item.dateline || "",
            contentLong: contentLong,
            isInjury: Boolean(item.injury),
            isTransaction: Boolean(item.transaction),
            publishedAt: publishedAt,
            playerRefs: refs,
            createdAt: new Date(),
          }).onConflictDoUpdate({
            target: sportradarNewsArticles.id,
            set: {
              title: item.title,
              contentLong: contentLong,
              isInjury: Boolean(item.injury),
              isTransaction: Boolean(item.transaction),
              playerRefs: refs,
            }
          });
          totalArticles++;
        }

        fetchedDays++;
        // 1.1s delay between calls to respect Sportradar trial rate limit (1 req/sec)
        await new Promise((resolve) => setTimeout(resolve, 1100));
      } catch (err: any) {
        logger.error(`[SPORTRADAR] Error syncing date ${dateStr} for ${sportCode}: ${err.message}`);
      }
    }

    // Update fetch log
    await db.insert(sportradarFetchLog).values({
      sport: sportCode,
      lastFetchedDate: todayStr,
      lastFetchedAt: new Date(),
    }).onConflictDoUpdate({
      target: sportradarFetchLog.sport,
      set: {
        lastFetchedDate: todayStr,
        lastFetchedAt: new Date(),
      }
    });

    logger.info(`[SPORTRADAR] Completed sync for ${sportCode}. Cached ${totalArticles} articles across ${fetchedDays} day(s).`);
    return { fetchedDays, totalArticles };
  }

  /**
   * Retrieves recent cached articles relevant to a player.
   */
  async getNewsForPlayer(playerName: string, sportInput?: string, limit: number = 5): Promise<any[]> {
    if (!playerName) return [];
    const { sportCode } = this.mapSport(sportInput);

    // Strip suffixes like Jr., Sr., II, III, IV, V for accurate last name matching
    const cleanName = playerName.replace(/\b(Jr\.?|Sr\.?|II|III|IV|V)\b/gi, "").trim();
    const parts = cleanName.split(/\s+/);
    const lastName = parts[parts.length - 1] || cleanName;

    // Search by playerRefs array OR title/content matching
    const res = await db.execute(sql`
      SELECT id, title, byline, dateline, content_long, is_injury, is_transaction, published_at
      FROM sportradar_news_articles
      WHERE sport = ${sportCode}
        AND (
          EXISTS (
            SELECT 1 FROM unnest(player_refs) AS ref_name
            WHERE ref_name ILIKE ${'%' + playerName + '%'} OR ref_name ILIKE ${'%' + lastName + '%'}
          )
          OR title ILIKE ${'%' + playerName + '%'}
          OR title ILIKE ${'%' + lastName + '%'}
          OR content_long ILIKE ${'%' + playerName + '%'}
        )
      ORDER BY published_at DESC
      LIMIT ${limit}
    `);

    return res.rows as any[];
  }

  /**
   * Formats cached articles into a concise prompt block for Vertex AI / Gemini.
   */
  formatNewsForPrompt(articles: any[]): string {
    if (!articles || articles.length === 0) {
      return "No recent Sportradar AP news articles found for this player in the last 7-14 days.";
    }

    return articles
      .map((a) => {
        const dateStr = a.published_at ? new Date(a.published_at).toISOString().slice(0, 10) : "Recent";
        const tags = [];
        if (a.is_injury) tags.push("INJURY");
        if (a.is_transaction) tags.push("TRANSACTION/TRADE");
        const tagStr = tags.length > 0 ? ` [${tags.join(", ")}]` : "";
        return `- [${dateStr}]${tagStr} "${a.title}"`;
      })
      .join("\n");
  }
}

export const sportradarNewsService = new SportradarNewsService();
