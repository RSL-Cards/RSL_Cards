import fp from "fastify-plugin";
import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import type { Env } from "../config/env.js";

export const corsPlugin = fp(async (app: FastifyInstance, _opts: { env: Env }) => {
  const raw = process.env.CORS_ORIGIN;
  const origin = raw ? raw.split(",").map((s) => s.trim()) : true;
  await app.register(cors, { origin });
});
