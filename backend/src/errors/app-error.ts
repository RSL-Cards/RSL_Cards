export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly details: any;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = "INTERNAL_SERVER_ERROR",
    details: any = null,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = isOperational;

    // Set the prototype explicitly to preserve correct class typing
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture standard stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}
