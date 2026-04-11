import { BaseAppError } from "@rsl/shared-types";

export enum CardDbErrorCode {
  CARD_NOT_FOUND = "CDB_CARD_NOT_FOUND",
  SYNC_FAILED = "CDB_SYNC_FAILED",
  INVALID_SEARCH_QUERY = "CDB_INVALID_SEARCH",
  INTERNAL_ERROR = "CDB_INTERNAL_ERROR",
}

export class CardDbError extends BaseAppError {
  constructor(
    code: CardDbErrorCode,
    message: string,
    statusCode: number = 400,
    details?: any
  ) {
    super(code, message, statusCode, details);
  }

  static cardNotFound(message = "Card not found in database") {
    return new CardDbError(CardDbErrorCode.CARD_NOT_FOUND, message, 404);
  }
}
