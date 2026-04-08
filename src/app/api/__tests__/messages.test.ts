/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestDb } from "@/lib/db";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type * as schema from "@/lib/db/schema";
import type { SendMessageResponse } from "@/lib/types";

let testDb: BetterSQLite3Database<typeof schema>;

vi.mock("@/lib/db", async (importOriginal) => {
  const orig = await importOriginal<typeof import("@/lib/db")>();
  return {
    ...orig,
    getDb: () => testDb,
  };
});

// Track discovery call count for simulating readyForThemes
let discoveryCallCount = 0;

vi.mock("@/lib/ai", () => ({
  getAIClient: () => ({
    async sendDiscoveryMessage() {
      discoveryCallCount++;
      if (discoveryCallCount >= 3) {
        return JSON.stringify({
          text: "I have enough info to propose themes!",
          readyForThemes: true,
        });
      }
      return "Tell me more about your background and what kind of site you envision.";
    },
    async proposeThemes() {
      return [
        {
          id: "theme-minimal",
          name: "Clean Minimalist",
          description: "A clean design.",
          templateId: "modern-minimal",
          previewColors: {
            primary: "#1a1a2e",
            secondary: "#16213e",
            accent: "#0f3460",
            background: "#ffffff",
          },
          personality: "professional",
        },
        {
          id: "theme-bold",
          name: "Bold Creative",
          description: "A vibrant design.",
          templateId: "bold-creative",
          previewColors: {
            primary: "#e94560",
            secondary: "#533483",
            accent: "#0f3460",
            background: "#1a1a2e",
          },
          personality: "creative",
        },
      ];
    },
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

import { POST as createConversation } from "@/app/api/conversations/route";
import {
  POST as sendMessage,
  GET as getMessages,
} from "@/app/api/conversations/[conversationId]/messages/route";

function makeMessageRequest(content: string): Request {
  return new Request("http://localhost/api/conversations/x/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}

function makeParams(conversationId: string) {
  return { params: Promise.resolve({ conversationId }) };
}

beforeEach(() => {
  testDb = createTestDb();
  discoveryCallCount = 0;
});

async function createConv(): Promise<string> {
  const res = await createConversation();
  const { conversationId } = await res.json();
  return conversationId;
}

describe("POST /api/conversations/[conversationId]/messages", () => {
  it("returns 404 for unknown conversation", async () => {
    const req = makeMessageRequest("hello");
    const res = await sendMessage(req as any, makeParams("unknown"));
    expect(res.status).toBe(404);
  });

  it("returns 400 for missing content", async () => {
    const convId = await createConv();
    const req = new Request("http://localhost/api/conversations/x/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await sendMessage(req as any, makeParams(convId));
    expect(res.status).toBe(400);
  });

  it("sends a discovery message and stays in discovery phase", async () => {
    const convId = await createConv();
    const req = makeMessageRequest("I am a developer");
    const res = await sendMessage(req as any, makeParams(convId));
    expect(res.status).toBe(200);

    const data: SendMessageResponse = await res.json();
    expect(data.phase).toBe("discovery");
    expect(data.message.role).toBe("assistant");
    expect(data.message.content).toBeTruthy();
  });

  it("transitions from discovery to theme_proposal after enough messages", async () => {
    const convId = await createConv();

    for (let i = 0; i < 2; i++) {
      const req = makeMessageRequest(`message ${i}`);
      await sendMessage(req as any, makeParams(convId));
    }

    const req = makeMessageRequest("message 3");
    const res = await sendMessage(req as any, makeParams(convId));
    const data: SendMessageResponse = await res.json();
    expect(data.phase).toBe("theme_proposal");
    expect(data.themeProposals).toBeDefined();
    expect(data.themeProposals!.length).toBeGreaterThan(0);
  });

  it("transitions from theme_proposal to complete when theme selected", async () => {
    const convId = await createConv();

    for (let i = 0; i < 3; i++) {
      const req = makeMessageRequest(`message ${i}`);
      await sendMessage(req as any, makeParams(convId));
    }

    const req = makeMessageRequest("I choose theme-minimal");
    const res = await sendMessage(req as any, makeParams(convId));
    const data: SendMessageResponse = await res.json();
    expect(data.phase).toBe("complete");
    expect(data.siteId).toBeDefined();
  });
});

describe("GET /api/conversations/[conversationId]/messages", () => {
  it("returns 404 for unknown conversation", async () => {
    const req = new Request("http://localhost/api/conversations/unknown/messages");
    const res = await getMessages(req as any, makeParams("unknown"));
    expect(res.status).toBe(404);
  });

  it("returns messages in order", async () => {
    const convId = await createConv();
    const req1 = makeMessageRequest("hello");
    await sendMessage(req1 as any, makeParams(convId));

    const getReq = new Request(
      `http://localhost/api/conversations/${convId}/messages`,
    );
    const res = await getMessages(getReq as any, makeParams(convId));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.messages).toHaveLength(2);
    expect(data.messages[0].role).toBe("user");
    expect(data.messages[1].role).toBe("assistant");
  });
});
