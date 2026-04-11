import { BaseAppError } from "@rsl/shared-types";

export enum InventoryErrorCode {
  ITEM_NOT_FOUND = "INV_ITEM_NOT_FOUND",
  INSUFFICIENT_QUANTITY = "INV_INSUFFICIENT_QUANTITY",
  INVALID_CARD_DATA = "INV_INVALID_CARD_DATA",
  UNAUTHORIZED_ACCESS = "INV_UNAUTHORIZED_ACCESS",
  INTERNAL_ERROR = "INV_INTERNAL_ERROR",
}

export class InventoryError extends BaseAppError {
  constructor(
    code: InventoryErrorCode,
    message: string,
    statusCode: number = 400,
    details?: any
  ) {
    super(code, message, statusCode, details);
  }

  static itemNotFound(message = "Inventory item not found") {
    return new InventoryError(InventoryErrorCode.ITEM_NOT_FOUND, message, 404);
  }

  static invalidData(message = "Invalid inventory data provided") {
    return new InventoryError(InventoryErrorCode.INVALID_CARD_DATA, message, 400);
  }
}
