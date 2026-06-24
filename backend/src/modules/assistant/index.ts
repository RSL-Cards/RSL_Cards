import { Elysia } from "elysia";
import { assistantRoutes } from "./assistant.controller.js";

export const assistantModule = new Elysia({ prefix: "/v1" })
  .use(assistantRoutes);
