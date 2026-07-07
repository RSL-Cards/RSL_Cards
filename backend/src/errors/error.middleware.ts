import { Elysia } from "elysia";
import { AppError } from "./app-error.js";
import { BaseAppError } from "@rsl/shared-types";
import { logger } from "../lib/logger.js";
import { promMetrics } from "../lib/metrics.js";

export const errorMiddleware = new Elysia({ name: "error-middleware" })
  .onError({ as: "global" }, ({ code, error, set, request, ...ctx }) => {
    const err = error as any;
    promMetrics.errorCount++;

    const startTime = (ctx as any).requestStartTime || Date.now();
    const traceId = (ctx as any).traceId || "no_trace";
    const elapsedMs = Date.now() - startTime;
    const timestamp = new Date().toISOString();

    // 1. Log error details with high visibility & Trace ID breakdown
    logger.error(`[TRACE ${traceId}] ✖── BREAK at ${elapsedMs}ms: [${code}] ${err.name || "Error"} - ${err.message || "Unknown error"}`);
    if (err.stack) {
      logger.debug(`[TRACE ${traceId}] Stack: ${err.stack}`);
    }

    if (set.headers) {
      set.headers["X-Trace-Id"] = traceId;
    }

    // 2. Resolve the response structure based on the error type
    if (error instanceof AppError || error instanceof BaseAppError) {
      set.status = error.statusCode;
      return {
        success: false,
        error: {
          code: error.errorCode,
          message: error.message,
          details: error.details,
          traceId,
          timestamp,
          elapsedMs,
        },
      };
    }

    // 3. Handle Elysia standard TypeBox validation errors
    if (code === "VALIDATION") {
      set.status = 422;
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request payload validation failed",
          details: err.message,
          traceId,
          timestamp,
          elapsedMs,
        },
      };
    }

    // 4. Default unhandled/unexpected system exceptions
    set.status = 500;
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: process.env.NODE_ENV === "production" 
          ? "An unexpected system error occurred" 
          : (err.message || "Unknown system error"),
        details: null,
        traceId,
        timestamp,
        elapsedMs,
      },
    };
  });
