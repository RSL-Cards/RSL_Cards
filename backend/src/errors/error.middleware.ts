import { Elysia } from "elysia";
import { AppError } from "./app-error.js";
import { BaseAppError } from "@rsl/shared-types";
import { logger } from "../lib/logger.js";

export const errorMiddleware = new Elysia({ name: "error-middleware" })
  .onError({ as: "global" }, ({ code, error, set }) => {
    const err = error as any;
    // 1. Log error details with high visibility
    logger.error(`[ERROR HANDLER] ${err.name || "Error"} (${code}): ${err.message || "Unknown error"}`);
    if (err.stack) {
      logger.debug(err.stack);
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
      },
    };
  });
