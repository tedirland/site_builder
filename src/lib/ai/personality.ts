import type { PersonalityTraits } from "@/lib/types";
import { createAIClient } from "./client";

export async function applyPersonalityCSS(
  baseCSS: string,
  personality: PersonalityTraits,
): Promise<string> {
  const client = createAIClient();
  return client.generatePersonalityCSS(baseCSS, personality);
}
