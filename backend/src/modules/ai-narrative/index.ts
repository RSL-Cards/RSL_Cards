import { Elysia } from "elysia";
import { AiNarrativeRepository } from "./ai-narrative.repository.js";
import { AiNarrativeService } from "./ai-narrative.service.js";
import { AiNarrativeController } from "./ai-narrative.controller.js";
import { requireDealer, requireAdmin } from "../../middleware/auth.js";

const repository = new AiNarrativeRepository();     
const service = new AiNarrativeService(repository);
const controller = new AiNarrativeController(service);

export const aiNarrativeModule = new Elysia({ prefix: "/v1/narratives" })
  .group("/admin", (app) => app
    .use(requireAdmin)
    .post("/generate", controller.adminGenerate)
    .patch("/:id/approve", controller.adminApprove)
    .patch("/:id/reject", controller.adminReject)
    .patch("/:id", controller.adminUpdate)
  )
  .group("", (app) => app
    .use(requireDealer)
    .post("/scan-card", controller.scanCard)
    .get("/trigger-ingestion", controller.triggerIngestion)
    .get("/feed", controller.getFeed)
    .get("/inventory", controller.getInventoryNarratives)
    .get("/daily-insight", controller.getDailyInsight)
    .get("/weekly-recap", controller.getWeeklyRecap)
    .get("/player/:playerName", controller.getPlayerNarratives)
    .get("/card/:cardId", controller.getCardNarratives)
    .get("/:id", controller.getNarrative)
  );
