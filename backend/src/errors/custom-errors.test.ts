import { describe, expect, test } from "bun:test";
import { AppError } from "./app-error.js";
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
} from "./custom-errors.js";

describe("Centralized Error Layer", () => {
  test("AppError base properties are set correctly", () => {
    const error = new AppError("Base error", 418, "TEAPOT", { foo: "bar" }, true);
    expect(error.message).toBe("Base error");
    expect(error.statusCode).toBe(418);
    expect(error.errorCode).toBe("TEAPOT");
    expect(error.details).toEqual({ foo: "bar" });
    expect(error.isOperational).toBe(true);
    expect(error instanceof Error).toBe(true);
  });

  test("BadRequestError default values", () => {
    const error = new BadRequestError();
    expect(error.statusCode).toBe(400);
    expect(error.errorCode).toBe("BAD_REQUEST");
    expect(error.message).toBe("Bad Request");
    expect(error.details).toBeNull();
  });

  test("UnauthorizedError customized values", () => {
    const error = new UnauthorizedError("Custom message", { sessionExpired: true });
    expect(error.statusCode).toBe(401);
    expect(error.errorCode).toBe("UNAUTHORIZED");
    expect(error.message).toBe("Custom message");
    expect(error.details).toEqual({ sessionExpired: true });
  });

  test("ValidationError customized values", () => {
    const error = new ValidationError("Invalid body", ["field is required"]);
    expect(error.statusCode).toBe(422);
    expect(error.errorCode).toBe("VALIDATION_ERROR");
    expect(error.message).toBe("Invalid body");
    expect(error.details).toEqual(["field is required"]);
  });

  test("InternalServerError is not marked as operational by default", () => {
    const error = new InternalServerError();
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(false);
  });
});
