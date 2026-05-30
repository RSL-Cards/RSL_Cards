import { AppError } from "./app-error.js";

export class BadRequestError extends AppError {
  constructor(message: string = "Bad Request", details: any = null) {
    super(message, 400, "BAD_REQUEST", details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized", details: any = null) {
    super(message, 401, "UNAUTHORIZED", details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden", details: any = null) {
    super(message, 403, "FORBIDDEN", details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Not Found", details: any = null) {
    super(message, 404, "NOT_FOUND", details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict", details: any = null) {
    super(message, 409, "CONFLICT", details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation Failed", details: any = null) {
    super(message, 422, "VALIDATION_ERROR", details);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal Server Error", details: any = null) {
    super(message, 500, "INTERNAL_SERVER_ERROR", details, false);
  }
}
