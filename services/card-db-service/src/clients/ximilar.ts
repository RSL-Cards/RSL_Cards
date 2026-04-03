import type { Env } from "../config/env.js";

export type CardIdentification = {
  playerName: string;
  year: number;
  setName: string;
  confidence: number;
};

export async function identifyCard(
  env: Env,
  imageBase64: string,
  logger: { info: (o: Record<string, unknown>) => void },
): Promise<CardIdentification> {
  if (!env.XIMILAR_API_KEY || env.XIMILAR_API_KEY.length === 0) {
    logger.info({ msg: "Ximilar mock mode" });
    return {
      playerName: "Mock Player",
      year: 2023,
      setName: "Mock Set",
      confidence: 0.5,
    };
  }
  void imageBase64;
  logger.info({ msg: "Ximilar API call stub — implement HTTP client" });
  return {
    playerName: "API Player",
    year: 2024,
    setName: "API Set",
    confidence: 0.9,
  };
}
