import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb } from "@/lib/db";
import {
  createConversation,
  getConversation,
  updateConversationPhase,
  createMessage,
  getMessagesByConversation,
  createResume,
  getResumeByConversation,
  createSite,
  getSiteBySlug,
  getSiteByConversation,
} from "@/lib/db/queries";
import type { ProfileData, ResumeData } from "@/lib/types";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/db/schema";

type Db = BetterSQLite3Database<typeof schema>;
let db: Db;

beforeEach(() => {
  db = createTestDb();
});

const sampleResumeData: ResumeData = {
  name: "Test User",
  email: "test@example.com",
  phone: "555-1234",
  summary: "A developer.",
  experience: [
    {
      company: "TestCo",
      title: "Dev",
      startDate: "2020-01",
      endDate: null,
      description: "Wrote code.",
    },
  ],
  education: [
    {
      institution: "Test Univ",
      degree: "B.S.",
      field: "CS",
      graduationDate: "2019-05",
    },
  ],
  skills: ["TypeScript", "React"],
  links: [{ label: "GitHub", url: "https://github.com/test" }],
};

const sampleProfileData: ProfileData = {
  name: "Test User",
  headline: "Developer",
  bio: "I build things.",
  experience: sampleResumeData.experience,
  education: sampleResumeData.education,
  skills: sampleResumeData.skills,
  projects: [],
  links: sampleResumeData.links,
  personality: {
    tone: "professional",
    colorPreference: null,
    interests: ["coding"],
  },
};

describe("Conversations", () => {
  it("creates and retrieves a conversation", () => {
    const conv = createConversation(db);
    expect(conv.id).toBeDefined();
    expect(conv.phase).toBe("discovery");
    expect(conv.resumeId).toBeNull();

    const fetched = getConversation(db, conv.id);
    expect(fetched).toBeDefined();
    expect(fetched!.id).toBe(conv.id);
  });

  it("returns undefined for unknown id", () => {
    const result = getConversation(db, "nonexistent");
    expect(result).toBeUndefined();
  });

  it("updates conversation phase", () => {
    const conv = createConversation(db);
    updateConversationPhase(db, conv.id, "theme_proposal");
    const updated = getConversation(db, conv.id)!;
    expect(updated.phase).toBe("theme_proposal");
    // updatedAt is refreshed (may match if same millisecond, so just check it exists)
    expect(updated.updatedAt).toBeDefined();
  });
});

describe("Messages", () => {
  it("creates and retrieves messages", () => {
    const conv = createConversation(db);
    const msg1 = createMessage(db, conv.id, "user", "Hello");
    const msg2 = createMessage(db, conv.id, "assistant", "Hi there");

    const msgs = getMessagesByConversation(db, conv.id);
    expect(msgs).toHaveLength(2);
    expect(msgs[0].id).toBe(msg1.id);
    expect(msgs[1].id).toBe(msg2.id);
    expect(msgs[0].role).toBe("user");
    expect(msgs[1].role).toBe("assistant");
  });

  it("returns empty array for no messages", () => {
    const conv = createConversation(db);
    const msgs = getMessagesByConversation(db, conv.id);
    expect(msgs).toEqual([]);
  });

  it("stores and retrieves JSON metadata", () => {
    const conv = createConversation(db);
    const meta = { themeId: "theme-1", score: 0.95 };
    const msg = createMessage(db, conv.id, "assistant", "Themed!", meta);
    expect(msg.metadata).toEqual(meta);

    const msgs = getMessagesByConversation(db, conv.id);
    expect(msgs[0].metadata).toEqual(meta);
  });

  it("handles null metadata", () => {
    const conv = createConversation(db);
    const msg = createMessage(db, conv.id, "user", "Plain message");
    expect(msg.metadata).toBeNull();

    const msgs = getMessagesByConversation(db, conv.id);
    expect(msgs[0].metadata).toBeNull();
  });

  it("enforces FK constraint on conversationId", () => {
    expect(() =>
      createMessage(db, "nonexistent", "user", "Orphan"),
    ).toThrow();
  });
});

describe("Resumes", () => {
  it("creates and retrieves a resume", () => {
    const conv = createConversation(db);
    const resume = createResume(
      db,
      conv.id,
      "resume.pdf",
      "pdf",
      "raw text content",
      sampleResumeData,
    );

    expect(resume.id).toBeDefined();
    expect(resume.parsedData).toEqual(sampleResumeData);

    const fetched = getResumeByConversation(db, conv.id);
    expect(fetched).toBeDefined();
    expect(fetched!.fileName).toBe("resume.pdf");
    expect(fetched!.fileType).toBe("pdf");
  });

  it("round-trips ResumeData JSON", () => {
    const conv = createConversation(db);
    createResume(db, conv.id, "r.docx", "docx", "", sampleResumeData);
    const fetched = getResumeByConversation(db, conv.id)!;
    expect(fetched.parsedData).toEqual(sampleResumeData);
    expect(fetched.parsedData!.skills).toContain("TypeScript");
    expect(fetched.parsedData!.experience[0].company).toBe("TestCo");
  });

  it("handles null parsedData", () => {
    const conv = createConversation(db);
    createResume(db, conv.id, "r.pdf", "pdf", "", null);
    const fetched = getResumeByConversation(db, conv.id)!;
    expect(fetched.parsedData).toBeNull();
  });

  it("returns undefined for conversation with no resume", () => {
    const conv = createConversation(db);
    const result = getResumeByConversation(db, conv.id);
    expect(result).toBeUndefined();
  });
});

describe("Sites", () => {
  it("creates and retrieves a site by slug", () => {
    const conv = createConversation(db);
    const site = createSite(
      db,
      conv.id,
      "test-site",
      sampleProfileData,
      "minimal",
      "<html></html>",
      "body {}",
    );

    expect(site.id).toBeDefined();
    expect(site.slug).toBe("test-site");

    const bySlug = getSiteBySlug(db, "test-site");
    expect(bySlug).toBeDefined();
    expect(bySlug!.id).toBe(site.id);
  });

  it("retrieves a site by conversationId", () => {
    const conv = createConversation(db);
    createSite(
      db,
      conv.id,
      "my-site",
      sampleProfileData,
      "bold",
      "<html></html>",
      "body {}",
      true,
    );

    const byConv = getSiteByConversation(db, conv.id);
    expect(byConv).toBeDefined();
    expect(byConv!.templateId).toBe("bold");
    expect(byConv!.personalityApplied).toBe(true);
  });

  it("round-trips ProfileData JSON", () => {
    const conv = createConversation(db);
    createSite(
      db,
      conv.id,
      "json-test",
      sampleProfileData,
      "minimal",
      "<html></html>",
      "body {}",
    );
    const fetched = getSiteBySlug(db, "json-test")!;
    expect(fetched.profileData).toEqual(sampleProfileData);
    expect(fetched.profileData.personality.tone).toBe("professional");
    expect(fetched.profileData.skills).toContain("React");
  });

  it("returns undefined for unknown slug", () => {
    expect(getSiteBySlug(db, "nope")).toBeUndefined();
  });

  it("returns undefined for conversation with no site", () => {
    const conv = createConversation(db);
    expect(getSiteByConversation(db, conv.id)).toBeUndefined();
  });

  it("enforces unique slug", () => {
    const conv1 = createConversation(db);
    const conv2 = createConversation(db);
    createSite(
      db,
      conv1.id,
      "unique-slug",
      sampleProfileData,
      "minimal",
      "<html></html>",
      "body {}",
    );
    expect(() =>
      createSite(
        db,
        conv2.id,
        "unique-slug",
        sampleProfileData,
        "bold",
        "<html></html>",
        "body {}",
      ),
    ).toThrow();
  });
});
