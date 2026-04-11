import { BaseAppError } from "@rsl/shared-types";

export enum UserErrorCode {
  USER_NOT_FOUND = "USER_NOT_FOUND",
  PROFILE_NOT_FOUND = "USER_PROFILE_NOT_FOUND",
  INVALID_INPUT = "USER_INVALID_INPUT",
  PLATFORM_CONNECTION_FAILED = "USER_PLATFORM_CONNECTION_FAILED",
  INTERNAL_ERROR = "USER_INTERNAL_ERROR",
}

export class UserError extends BaseAppError {
  constructor(
    code: UserErrorCode,
    message: string,
    statusCode: number = 400,
    details?: any
  ) {
    super(code, message, statusCode, details);
  }

  static notFound(message = "User not found") {
    return new UserError(UserErrorCode.USER_NOT_FOUND, message, 404);
  }

  static profileNotFound(message = "Profile not found") {
    return new UserError(UserErrorCode.PROFILE_NOT_FOUND, message, 404);
  }

  static invalidInput(message = "Invalid input details", details?: any) {
    return new UserError(UserErrorCode.INVALID_INPUT, message, 400, details);
  }
}
