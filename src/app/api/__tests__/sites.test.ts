/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestDb } from "@/lib/db";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type * as schema from "@/lib/db/schema";

let testDb: BetterSQLite3Database<typeof schema>;

vi.mock("@/lib/db", async (importOriginal) => {
  const orig = await importOriginal<typeof import("@/lib/db")>();
  return {
    ...orig,
    getDb: () => testDb,
  };
});

vi.mock("@/lib/ai", () => ({
  getAIClient: () => ({
    async extractProfileData() {
      return {
        name: "Alex Johnson",
        headline: "Full-Stack Developer",
        bio: "I build web apps.",
        experience: [],
        education: [],
        skills: ["TypeScript"],
        projects: [],
        links: [],
        personality: {
          tone: "professional",
          colorPreference: null,
          interests: ["web development"],
        },
      };
    },
    async generatePersonalityCSS(baseCSS: string) {
      return baseCSS;
    },
  }),
  getSiteGenerator: () => ({
    async generate() {
      return {
        html: "<!DOCTYPE html><html><head></head><body><h1>Portfolio</h1></body></html>",
        css: "body { font-family: sans-serif; }",
      };
    },
  }),
}));

import { POST as createSite } from "@/app/api/sites/route";
import { GET as getSiteRoute } from "@/app/api/sites/[siteId]/route";
import { POST as createConversation } from "@/app/api/conversations/route";

beforeEach(() => {
  testDb = createTestDb();
});

async function createConv(): Promise<string> {
  const res = await createConversation();
  const { conversationId } = await res.json();
  return conversationId;
}

describe("POST /api/sites", () => {
  it("returns 400 for missing fields", async () => {
    const req = new Request("http://localhost/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await createSite(req as any);
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown conversation", async () => {
    const req = new Request("http://localhost/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: "unknown",
        selectedThemeId: "theme-1",
      }),
    });
    const res = await createSite(req as any);
    expect(res.status).toBe(404);
  });

  it("generates a site and returns 201", async () => {
    const convId = await createConv();
    const req = new Request("http://localhost/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: convId,
        selectedThemeId: "theme-minimal",
      }),
    });
    const res = await createSite(req as any);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.siteId).toBeDefined();
    expect(data.slug).toBeDefined();
    expect(data.previewUrl).toBe(`/${data.slug}`);
  });
});

describe("GET /api/sites/[siteId]", () => {
  it("returns 404 for unknown site", async () => {
    const req = new Request("http://localhost/api/sites/unknown");
    const res = await getSiteRoute(req as any, {
      params: Promise.resolve({ siteId: "unknown" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns a site after creation", async () => {
    const convId = await createConv();
    const createReq = new Request("http://localhost/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: convId,
        selectedThemeId: "theme-minimal",
      }),
    });
    const createRes = await createSite(createReq as any);
    const { siteId } = await createRes.json();

    const getReq = new Request(`http://localhost/api/sites/${siteId}`);
    const res = await getSiteRoute(getReq as any, {
      params: Promise.resolve({ siteId }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe(siteId);
    expect(data.html).toBeTruthy();
    expect(data.css).toBeTruthy();
  });
});
