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
    if (!this.ai) {
      throw new Error("Vertex AI is disabled.");
    }
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
          maxOutputTokens: 8192,
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
   * Generates content from text prompt with timeout and retry logic.
   */
  async generateFromText(
    prompt: string,
    modelName: string = "gemini-3.1-flash-lite"
  ) {
    if (!this.ai) {
      throw new Error("Vertex AI is disabled.");
    }
    const timeoutMs = 60000; // 60 seconds
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Vertex AI request timed out")), timeoutMs)
    );

    try {
      logger.info({ modelName, projectId: env.VERTEX_AI_PROJECT_ID }, "Sending request to Vertex AI");

      const generationPromise = this.ai.models.generateContent({
        model: modelName,
        contents: [prompt],
        config: {
          temperature: 0.1,
          maxOutputTokens: 8192,
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

  /**
   * Generates a conversational response with full multi-turn AI function calling / tools execution.
   */
  async generateChatWithTools(
    systemInstruction: string,
    history: any[],
    message: string,
    functionDeclarations: any[],
    toolHandler: (functionName: string, args: any) => Promise<any>,
    modelName: string = "gemini-3.1-flash-lite"
  ) {
    const timeoutMs = 90000; // 90 seconds for potential multi-turn function calling
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Vertex AI request with tools timed out")), timeoutMs)
    );

    try {
      logger.info({ modelName, projectId: env.VERTEX_AI_PROJECT_ID, toolsCount: functionDeclarations.length }, "Sending chat request with tools to Vertex AI");

      const contents: any[] = [
        ...history,
        { role: "user", parts: [{ text: message }] }
      ];

      const maxRounds = 6;
      for (let round = 0; round < maxRounds; round++) {
        const generationPromise = this.ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: { parts: [{ text: systemInstruction }] },
            tools: functionDeclarations && functionDeclarations.length > 0 ? [{ functionDeclarations }] : undefined,
            temperature: 0.2,
            maxOutputTokens: 4096,
            topP: 0.95,
            seed: 0,
          }
        });

        const result = await Promise.race([
          generationPromise,
          timeoutPromise,
        ]);

        if (result.functionCalls && result.functionCalls.length > 0) {
          logger.info({ round, functionCalls: result.functionCalls.map((fc: any) => fc.name) }, "Model requested tool calls");

          if (result.candidates?.[0]?.content) {
            contents.push(result.candidates[0].content);
          } else {
            contents.push({
              role: "model",
              parts: result.functionCalls.map((fc: any) => ({ functionCall: fc }))
            });
          }

          const functionResponseParts = [];
          for (const fc of result.functionCalls) {
            logger.info({ functionName: fc.name, args: fc.args }, "Executing AI function tool");
            try {
              const toolResult = await toolHandler(fc.name ?? "", fc.args || {});
              functionResponseParts.push({
                functionResponse: {
                  name: fc.name,
                  response: { result: toolResult }
                }
              });
            } catch (err: any) {
              logger.error({ functionName: fc.name, error: err.message }, "AI function tool execution error");
              functionResponseParts.push({
                functionResponse: {
                  name: fc.name,
                  response: { error: err.message || "Failed to execute function" }
                }
              });
            }
          }

          contents.push({
            role: "user",
            parts: functionResponseParts
          });
          continue;
        }

        const responseText = result.text;
        if (!responseText && round === maxRounds - 1) {
          throw new Error("No text returned from Vertex AI after function calls");
        }
        if (responseText) {
          logger.info({ modelName, round }, "Received final chat text response after function calls");
          return responseText;
        }
      }

      throw new Error("Exceeded maximum tool execution rounds without a text response");
    } catch (error: any) {
      logger.error({ error: error.message, stack: error.stack }, "Vertex AI chat with tools request failed");
      throw error;
    }
  }

  /**
   * Generates content using a prompt and an array of items with optional inline base64 images.
   */
  async filterListingsWithImages(
    prompt: string,
    listings: { id: string; title: string; imageBase64?: string; mimeType?: string }[],
    modelName: string = "gemini-3.1-flash-lite"
  ) {
    const timeoutMs = 60000; // 60 seconds
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Vertex AI request timed out")), timeoutMs)
    );

    try {
      logger.info({ modelName, projectId: env.VERTEX_AI_PROJECT_ID, itemsCount: listings.length }, "Sending multi-modal filter request to Vertex AI");

      const parts: any[] = [{ text: prompt }];

      for (const listing of listings) {
        parts.push({ text: `Listing ID: ${listing.id}\nTitle: ${listing.title}` });
        if (listing.imageBase64) {
          parts.push({
            inlineData: {
              data: listing.imageBase64,
              mimeType: listing.mimeType || "image/jpeg",
            }
          });
        }
      }

      const generationPromise = this.ai.models.generateContent({
        model: modelName,
        contents: [{ role: "user", parts }],
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
        throw new Error("No text returned from Vertex AI multi-modal filter");
      }

      logger.info({ modelName }, "Received multi-modal filter response from Vertex AI");
      return responseText;
    } catch (error: any) {
      logger.error({ error: error.message, stack: error.stack }, "Vertex AI multi-modal filter request failed");
      throw error;
    }
  }
}

export const vertexAiClient = new VertexAiClient();
