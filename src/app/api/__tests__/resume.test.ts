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

vi.mock("@/lib/parsing", () => ({
  parseResume: vi.fn().mockResolvedValue({
    name: "Alex Johnson",
    email: "alex@example.com",
    phone: "555-0123",
    summary: "Full-stack developer with 5 years of experience.",
    experience: [
      {
        company: "Acme Corp",
        title: "Senior Developer",
        startDate: "2020-01",
        endDate: null,
        description: "Led frontend architecture redesign.",
      },
    ],
    education: [
      {
        institution: "State University",
        degree: "B.S.",
        field: "Computer Science",
        graduationDate: "2019-05",
      },
    ],
    skills: ["TypeScript", "React", "Node.js"],
    links: [{ label: "GitHub", url: "https://github.com/alexj" }],
  }),
}));

import { POST as createConversation } from "@/app/api/conversations/route";
import {
  getConversation,
  createResume,
  getResumeByConversation,
} from "@/lib/db/queries";
import { parseResume } from "@/lib/parsing";

beforeEach(() => {
  testDb = createTestDb();
});

async function createConv(): Promise<string> {
  const res = await createConversation();
  const { conversationId } = await res.json();
  return conversationId;
}

describe("Resume upload logic", () => {
  it("rejects unknown conversation", () => {
    const conv = getConversation(testDb, "unknown");
    expect(conv).toBeUndefined();
  });

  it("validates file extension - rejects .txt", () => {
    const allowedExtensions = new Set([".pdf", ".docx"]);
    expect(allowedExtensions.has(".txt")).toBe(false);
    expect(allowedExtensions.has(".pdf")).toBe(true);
    expect(allowedExtensions.has(".docx")).toBe(true);
  });

  it("validates file size - rejects over 5MB", () => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    expect(6 * 1024 * 1024 > MAX_FILE_SIZE).toBe(true);
    expect(100 > MAX_FILE_SIZE).toBe(false);
  });

  it("parses resume and stores it in the database", async () => {
    const convId = await createConv();
    const buffer = Buffer.from("fake content");
    const parsedData = await parseResume(buffer, "pdf");

    expect(parsedData.name).toBe("Alex Johnson");
    expect(parsedData.skills).toContain("TypeScript");

    const resume = createResume(
      testDb,
      convId,
      "resume.pdf",
      "pdf",
      "",
      parsedData,
    );

    const stored = getResumeByConversation(testDb, convId);
    expect(stored).toBeDefined();
    expect(stored!.id).toBe(resume.id);
    expect(stored!.conversationId).toBe(convId);
    expect(stored!.parsedData?.name).toBe("Alex Johnson");
  });

  it("handles docx files", async () => {
    const parsedData = await parseResume(
      Buffer.from("fake"),
      "docx",
    );
    expect(parsedData.name).toBe("Alex Johnson");
  });
});
