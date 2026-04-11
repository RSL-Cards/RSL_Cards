import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { BaseAppError, type ApiErrorResponse } from "@rsl/shared-types";

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler(
    (error: FastifyError | BaseAppError, request: FastifyRequest, reply: FastifyReply) => {
      let statusCode = 500;
      let errorCode = "INTERNAL_SERVER_ERROR";
      let message = "An unexpected error occurred";
      let details: any = undefined;

      if (error instanceof BaseAppError) {
        statusCode = error.statusCode;
        errorCode = error.errorCode;
        message = error.message;
        details = error.details;
      } else if (error.statusCode) {
        statusCode = error.statusCode;
        errorCode = error.name.toUpperCase().replace(/ERROR$/, "");
        message = error.message;
      }

      // Log the error with request context
      request.log.error({
        err: error,
        requestId: request.id,
        errorCode,
      }, message);

      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: errorCode,
          message: message,
          details: details,
          requestId: request.id as string,
        },
      };

      reply.status(statusCode).send(response);
    },
  );
}
