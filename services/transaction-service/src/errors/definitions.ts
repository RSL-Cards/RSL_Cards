import { BaseAppError } from "@rsl/shared-types";

export enum TransactionErrorCode {
  TRANSACTION_NOT_FOUND = "TX_NOT_FOUND",
  INVALID_TX_TYPE = "TX_INVALID_TYPE",
  INVENTORY_MISSING = "TX_INVENTORY_MISSING",
  CUSTOMER_NOT_FOUND = "TX_CUSTOMER_NOT_FOUND",
  INTERNAL_ERROR = "TX_INTERNAL_ERROR",
}

export class TransactionError extends BaseAppError {
  constructor(
    code: TransactionErrorCode,
    message: string,
    statusCode: number = 400,
    details?: any
  ) {
    super(code, message, statusCode, details);
  }

  static notFound(message = "Transaction record not found") {
    return new TransactionError(TransactionErrorCode.TRANSACTION_NOT_FOUND, message, 404);
  }

  static inventoryMissing(message = "Associated inventory item not found") {
    return new TransactionError(TransactionErrorCode.INVENTORY_MISSING, message, 400);
  }
}
