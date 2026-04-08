/**
 * AI client factory. Uses real Claude API when a valid ANTHROPIC_API_KEY is set,
 * falls back to stubs for development/testing.
 */
import type { AIClient, SiteGenerator } from "@/lib/types";
import { aiClient as stubAIClient, siteGenerator as stubSiteGenerator } from "@/app/api/_stubs";

function hasValidApiKey(): boolean {
  const key = process.env.ANTHROPIC_API_KEY;
  return !!key && key.startsWith("sk-ant-");
}

let cachedAIClient: AIClient | null = null;
let cachedSiteGenerator: SiteGenerator | null = null;

export function getAIClient(): AIClient {
  if (cachedAIClient) return cachedAIClient;
  if (hasValidApiKey()) {
    const { createAIClient } = require("./client");
    cachedAIClient = createAIClient();
  } else {
    cachedAIClient = stubAIClient;
  }
  return cachedAIClient!;
}

export function getSiteGenerator(): SiteGenerator {
  if (cachedSiteGenerator) return cachedSiteGenerator;
  if (hasValidApiKey()) {
    const { createSiteGenerator } = require("@/lib/generation/orchestrator");
    cachedSiteGenerator = createSiteGenerator();
  } else {
    cachedSiteGenerator = stubSiteGenerator;
  }
  return cachedSiteGenerator!;
}
