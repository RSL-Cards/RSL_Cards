import { Redis } from "ioredis";
import { env } from "../config/index.js";
import { logger } from "../lib/logger.js";

export class RedisAdapter {
  private client: Redis;
  private isConnected = false;

  constructor() {
    logger.info(`🔌 Connecting to Redis at ${env.REDIS_URL}...`);
    this.client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null, // Critical requirement for BullMQ
      reconnectOnError: () => true,
    });

    this.client.on("connect", () => {
      this.isConnected = true;
      logger.info("✅ Redis connected successfully");
    });

    this.client.on("error", (err) => {
      this.isConnected = false;
      logger.error(`❌ Redis connection error: ${err.message}`);
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (err: any) {
      logger.error(`Redis GET error for key ${key}: ${err.message}`);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.set(key, value, "EX", ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch (err: any) {
      logger.error(`Redis SET error for key ${key}: ${err.message}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err: any) {
      logger.error(`Redis DELETE error for key ${key}: ${err.message}`);
    }
  }

  async checkHealth(): Promise<{ status: "healthy" | "unhealthy"; error?: string }> {
    try {
      const pong = await this.client.ping();
      if (pong === "PONG") {
        return { status: "healthy" };
      }
      return { status: "unhealthy", error: `Unexpected ping response: ${pong}` };
    } catch (err: any) {
      return { status: "unhealthy", error: err.message };
    }
  }

  async close(): Promise<void> {
    try {
      await this.client.quit();
      this.isConnected = false;
      logger.info("🔌 Redis connection closed gracefully");
    } catch (err: any) {
      logger.error(`Redis quit error: ${err.message}`);
    }
  }
}

export const redisAdapter = new RedisAdapter();
