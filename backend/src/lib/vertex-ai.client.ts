import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { env } from "../config/index.js";
import { logger } from "./logger.js";

export class VertexAiClient {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      // vertexai: true,
      // project: env.VERTEX_AI_PROJECT_ID,
      // location: env.VERTEX_AI_LOCATION,
      apiKey: env.GEMINI_API_KEY || env.GOOGLE_CLOUD_API_KEY,
    });
  }

  /**
   * Generates content from an image and prompt with timeout and retry logic.
   */
  async generateFromImage(
    prompt: string,
    imageBase64: string,
    mimeType: string = "image/jpeg",
    modelName: string = "gemini-3.1-flash-lite"
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

  /**
   * Generates a conversational response using system instructions and message history.
   */
  async generateChat(
    systemInstruction: string,
    history: { role: string; parts: { text: string }[] }[],
    message: string,
    modelName: string = "gemini-3.1-flash-lite"
  ) {
    const timeoutMs = 60000; // 60 seconds
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Vertex AI request timed out")), timeoutMs)
    );

    try {
      logger.info({ modelName, projectId: env.VERTEX_AI_PROJECT_ID }, "Sending chat request to Vertex AI");

      const contents = [
        ...history,
        { role: "user", parts: [{ text: message }] }
      ];

      const generationPromise = this.ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction: { parts: [{ text: systemInstruction }] },
          temperature: 0.3,
          maxOutputTokens: 2048,
          topP: 0.95,
          seed: 0,
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

      logger.info({ modelName }, "Received chat response from Vertex AI");
      return responseText;
    } catch (error: any) {
      logger.error({ error: error.message, stack: error.stack }, "Vertex AI chat request failed");
      throw error;
    }
  }
}

export const vertexAiClient = new VertexAiClient();
