import type { Env } from "../config/env.js";

export type NarrativeContext = { topic: string; data?: Record<string, unknown> };
export type NarrativeOutput = { headline: string; body: string };

export async function generateNarrative(
  env: Env,
  context: NarrativeContext,
  logger: { info: (o: Record<string, unknown>) => void },
): Promise<NarrativeOutput> {
  if (env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY.length > 0) {
    logger.info({ msg: "Claude API call stub — wire Anthropic SDK" });
    return {
      headline: "Live: " + context.topic,
      body: "Generated narrative body (stub).",
    };
  }
  logger.info({ msg: "Claude API: mock mode (no API key)" });
  return {
    headline: "Mike Trout cards up 15%",
    body: "Mock narrative...",
  };
}
