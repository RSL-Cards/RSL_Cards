import pino from "pino";
import { env } from "../config/index.js";

const isDev = env.NODE_ENV === "development" || env.NODE_ENV === "dev";

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      }
    : undefined,
});
