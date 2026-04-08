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

import { POST } from "@/app/api/conversations/route";
import { GET } from "@/app/api/conversations/[conversationId]/route";
import { getConversation } from "@/lib/db/queries";

function makeParams(conversationId: string) {
  return { params: Promise.resolve({ conversationId }) };
}

beforeEach(() => {
  testDb = createTestDb();
});

describe("POST /api/conversations", () => {
  it("creates a conversation and returns 201", async () => {
    const res = await POST();
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.conversationId).toBeDefined();
    expect(typeof data.conversationId).toBe("string");
  });

  it("stores the conversation in the database", async () => {
    const res = await POST();
    const data = await res.json();
    const conv = getConversation(testDb, data.conversationId);
    expect(conv).toBeDefined();
    expect(conv!.phase).toBe("discovery");
    expect(conv!.resumeId).toBeNull();
  });
});

describe("GET /api/conversations/[conversationId]", () => {
  it("returns 404 for unknown conversation", async () => {
    const req = new Request("http://localhost/api/conversations/unknown");
    const res = await GET(req as any, makeParams("unknown"));
    expect(res.status).toBe(404);
  });

  it("returns conversation with messages", async () => {
    const createRes = await POST();
    const { conversationId } = await createRes.json();

    const req = new Request(
      `http://localhost/api/conversations/${conversationId}`,
    );
    const res = await GET(req as any, makeParams(conversationId));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.conversation.id).toBe(conversationId);
    expect(data.conversation.phase).toBe("discovery");
    expect(Array.isArray(data.messages)).toBe(true);
    expect(data.messages).toHaveLength(0);
  });
});
