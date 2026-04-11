import { BaseAppError } from "@rsl/shared-types";

export enum AdminErrorCode {
  FORBIDDEN = "ADM_FORBIDDEN",
  LOG_NOT_FOUND = "ADM_LOG_NOT_FOUND",
  FLAG_NOT_FOUND = "ADM_FLAG_NOT_FOUND",
  INTERNAL_ERROR = "ADM_INTERNAL_ERROR",
}

export class AdminError extends BaseAppError {
  constructor(
    code: AdminErrorCode,
    message: string,
    statusCode: number = 400,
    details?: any
  ) {
    super(code, message, statusCode, details);
  }

  static forbidden(message = "Administrative access required") {
    return new AdminError(AdminErrorCode.FORBIDDEN, message, 403);
  }
}
