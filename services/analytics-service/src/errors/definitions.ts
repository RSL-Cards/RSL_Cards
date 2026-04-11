import { BaseAppError } from "@rsl/shared-types";

export enum AnalyticsErrorCode {
  REPORT_NOT_FOUND = "ANL_REPORT_NOT_FOUND",
  INVALID_DATE_RANGE = "ANL_INVALID_RANGE",
  INTERNAL_ERROR = "ANL_INTERNAL_ERROR",
}

export class AnalyticsError extends BaseAppError {
  constructor(
    code: AnalyticsErrorCode,
    message: string,
    statusCode: number = 400,
    details?: any
  ) {
    super(code, message, statusCode, details);
  }

  static invalidRange(message = "Invalid date range provided") {
    return new AnalyticsError(AnalyticsErrorCode.INVALID_DATE_RANGE, message, 400);
  }
}
