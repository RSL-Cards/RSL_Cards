import { Redis } from "ioredis";
import { env } from "../../config/index.js";
import { logger } from "../../lib/logger.js";
import { EventEmitter } from "events";
import { redisAdapter } from "../../adapters/redis.adapter.js";

// Global emitter for routing pub/sub messages to individual streams
export const sseEmitter = new EventEmitter();
sseEmitter.setMaxListeners(0); // Allow unlimited listeners (one per SSE connection)

class SSEService {
  private subscriberClient: Redis | null = null;
  private isConnected = false;

  constructor() {
    this.initSubscriber();
  }

  private initSubscriber() {
    if (!env.REDIS_URL) {
      logger.warn("No REDIS_URL provided, SSE Service will not start.");
      return;
    }

    this.subscriberClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      reconnectOnError: () => true,
    });

    this.subscriberClient.on("connect", () => {
      this.isConnected = true;
      logger.info("📡 SSE Redis subscriber connected");
    });

    this.subscriberClient.on("ready", () => {
      // Subscribe when connection is fully ready to avoid interrupting ioredis handshake
      this.subscriberClient?.psubscribe("user-notifications:*", (err) => {
        if (err) {
          logger.error(`Failed to psubscribe to notifications: ${err.message}`);
        }
      });
    });

    this.subscriberClient.on("error", (err) => {
      this.isConnected = false;
      logger.error(`SSE Redis subscriber error: ${err.message}`);
    });

    this.subscriberClient.on("pmessage", (pattern, channel, message) => {
      if (pattern === "user-notifications:*") {
        const userId = channel.split(":")[1];
        if (userId) {
          try {
            const parsedMessage = JSON.parse(message);
            // Emit to local node process listeners
            sseEmitter.emit(`notification:${userId}`, parsedMessage);
          } catch (e) {
            logger.error(`Failed to parse SSE message from Redis: ${message}`);
          }
        }
      }
    });
  }

  async publish(userId: string, data: any) {
    try {
      const payload = JSON.stringify(data);
      const publisherClient = redisAdapter.getClient();
      if (publisherClient) {
        await publisherClient.publish(`user-notifications:${userId}`, payload);
      } else {
        // Fallback for single instance if Redis isn't connected properly
        sseEmitter.emit(`notification:${userId}`, data);
      }
    } catch (err: any) {
      logger.error(`Failed to publish SSE event for user ${userId}: ${err.message}`);
    }
  }
}

export const sseService = new SSEService();
