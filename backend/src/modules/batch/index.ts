import { Elysia, t } from "elysia";
import { BatchController } from "./batch.controller.js";
import { BatchService } from "./batch.service.js";
import { requireDealer } from "../../middleware/auth.js";

const service = new BatchService();
const controller = new BatchController(service);

export const batchRouter = new Elysia({ prefix: "/batch" })
  .use(requireDealer)
  .post("/upload", controller.uploadFile, {
    body: t.Object({
      rawText: t.String(),
    }),
  })
  .post("/scan-multi", controller.scanMulti, {
    body: t.Object({
      image: t.String(),
    }),
  })
  .get("/jobs", controller.listJobs)
  .get("/jobs/:id", controller.getJob);
