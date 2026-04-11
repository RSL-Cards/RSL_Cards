import { BaseAppError } from "@rsl/shared-types";

export enum AuthErrorCode {
  INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS",
  USER_ALREADY_EXISTS = "AUTH_USER_ALREADY_EXISTS",
  USER_NOT_FOUND = "AUTH_USER_NOT_FOUND",
  INVALID_REFRESH_TOKEN = "AUTH_INVALID_REFRESH_TOKEN",
  TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED",
  UNAUTHORIZED = "AUTH_UNAUTHORIZED",
  FORBIDDEN = "AUTH_FORBIDDEN",
  INTERNAL_ERROR = "AUTH_INTERNAL_ERROR",
}

export class AuthError extends BaseAppError {
  constructor(
    code: AuthErrorCode,
    message: string,
    statusCode: number = 400,
    details?: any
  ) {
    super(code, message, statusCode, details);
  }

  static unauthorized(message = "Unauthorized access") {
    return new AuthError(AuthErrorCode.UNAUTHORIZED, message, 401);
  }

  static forbidden(message = "Forbidden access") {
    return new AuthError(AuthErrorCode.FORBIDDEN, message, 403);
  }

  static invalidCredentials(message = "Invalid email or password") {
    return new AuthError(AuthErrorCode.INVALID_CREDENTIALS, message, 401);
  }

  static userAlreadyExists(message = "User with this email already exists") {
    return new AuthError(AuthErrorCode.USER_ALREADY_EXISTS, message, 409);
  }
}
