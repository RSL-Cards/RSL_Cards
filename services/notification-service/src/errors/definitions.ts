import { BaseAppError } from "@rsl/shared-types";

export enum NotificationErrorCode {
  NOTIF_NOT_FOUND = "NTF_NOT_FOUND",
  PUSH_DELIVERY_FAILED = "NTF_PUSH_FAILED",
  INVALID_CHANNEL = "NTF_INVALID_CHANNEL",
  SHOW_NOT_FOUND = "NTF_SHOW_NOT_FOUND",
  INTERNAL_ERROR = "NTF_INTERNAL_ERROR",
}

export class NotificationError extends BaseAppError {
  constructor(
    code: NotificationErrorCode,
    message: string,
    statusCode: number = 400,
    details?: any
  ) {
    super(code, message, statusCode, details);
  }

  static notFound(message = "Notification not found") {
    return new NotificationError(NotificationErrorCode.NOTIF_NOT_FOUND, message, 404);
  }
}
