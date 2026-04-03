import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler(
    (error: FastifyError, _request: FastifyRequest, reply: FastifyReply) => {
      const status = error.statusCode ?? 500;
      reply.status(status).send({
        error: error.name,
        message: error.message,
        statusCode: status,
      });
    },
  );
}
