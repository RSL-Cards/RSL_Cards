import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { env } from "../config/index.js";
import { logger } from "./logger.js";

export class VertexAiClient {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      vertexai: true,
      project: env.VERTEX_AI_PROJECT_ID,
      location: env.VERTEX_AI_LOCATION,
    });
  }

  /**
   * Generates content from an image and prompt with timeout and retry logic.
   */
  async generateFromImage(
    prompt: string,
    imageBase64: string,
    mimeType: string = "image/jpeg",
    modelName: string = "gemini-1.5-flash"
  ) {
    // Timeout Promise
    const timeoutMs = 60000; // 60 seconds
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Vertex AI request timed out")), timeoutMs)
    );

    try {
      logger.info({ modelName, projectId: env.VERTEX_AI_PROJECT_ID }, "Sending request to Vertex AI");

      const generationPromise = this.ai.models.generateContent({
        model: modelName,
        contents: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          prompt
        ],
        config: {
          temperature: 0.1,
          maxOutputTokens: 1024,
          topP: 0.95,
          seed: 0,
          responseMimeType: "application/json",
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE }
          ],
        }
      });

      const result = await Promise.race([
        generationPromise,
        timeoutPromise,
      ]);

      const responseText = result.text;

      if (!responseText) {
        throw new Error("No text returned from Vertex AI");
      }

      logger.info({ modelName }, "Received response from Vertex AI");
      return responseText;
    } catch (error: any) {
      logger.error({ error: error.message, stack: error.stack }, "Vertex AI request failed");
      throw error;
    }
  }
}

export const vertexAiClient = new VertexAiClient();
