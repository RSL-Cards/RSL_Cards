import { Elysia, t } from "elysia";
import { requireDealer } from "../../middleware/auth.js";
import { AssistantService } from "./assistant.service.js";

const assistantService = new AssistantService();

export const assistantRoutes = new Elysia({ prefix: "/assistant" })
  .use(requireDealer)
  .post("/chat", async ({ body, request }: any) => {
    const { message, history = [] } = body;
    const userId = request.headers.get("x-user-id");
    
    if (!message) {
      throw new Error("Message is required");
    }

    const responseText = await assistantService.processQuery(userId, message, history);

    return {
      success: true,
      data: {
        response: responseText
      }
    };
  }, {
    body: t.Object({
      message: t.String(),
      history: t.Optional(t.Array(t.Object({
        role: t.String(),
        parts: t.Array(t.Object({
          text: t.String()
        }))
      })))
    })
  });
