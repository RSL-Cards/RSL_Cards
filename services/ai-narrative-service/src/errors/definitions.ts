import { BaseAppError } from "@rsl/shared-types";

export enum AiErrorCode {
  GENERATION_FAILED = "AI_GENERATION_FAILED",
  NARRATIVE_NOT_FOUND = "AI_NARRATIVE_NOT_FOUND",
  INVALID_PROMPT = "AI_INVALID_PROMPT",
  INTERNAL_ERROR = "AI_INTERNAL_ERROR",
}

export class AiError extends BaseAppError {
  constructor(
    code: AiErrorCode,
    message: string,
    statusCode: number = 400,
    details?: any
  ) {
    super(code, message, statusCode, details);
  }

  static generationFailed(message = "AI narrative generation failed", details?: any) {
    return new AiError(AiErrorCode.GENERATION_FAILED, message, 500, details);
  }
}
