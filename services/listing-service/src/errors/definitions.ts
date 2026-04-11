import { BaseAppError } from "@rsl/shared-types";

export enum ListingErrorCode {
  LISTING_NOT_FOUND = "LST_NOT_FOUND",
  PLATFORM_ERROR = "LST_PLATFORM_ERROR",
  INVALID_LIST_PRICE = "LST_INVALID_PRICE",
  UNAUTHORIZED = "LST_UNAUTHORIZED",
  INTERNAL_ERROR = "LST_INTERNAL_ERROR",
}

export class ListingError extends BaseAppError {
  constructor(
    code: ListingErrorCode,
    message: string,
    statusCode: number = 400,
    details?: any
  ) {
    super(code, message, statusCode, details);
  }

  static notFound(message = "Listing not found") {
    return new ListingError(ListingErrorCode.LISTING_NOT_FOUND, message, 404);
  }

  static platformError(message: string, details?: any) {
    return new ListingError(ListingErrorCode.PLATFORM_ERROR, message, 502, details);
  }
}
