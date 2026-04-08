import { eq } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { v4 as uuid } from "uuid";
import * as schema from "./schema";
import type {
  Conversation,
  ConversationPhase,
  Message,
  Resume,
  ResumeData,
  Site,
  ProfileData,
} from "@/lib/types";

type Db = BetterSQLite3Database<typeof schema>;

export function createConversation(db: Db): Conversation {
  const now = new Date().toISOString();
  const row = {
    id: uuid(),
    phase: "discovery" as const,
    resumeId: null,
    createdAt: now,
    updatedAt: now,
  };
  db.insert(schema.conversations).values(row).run();
  return row;
}

export function getConversation(
  db: Db,
  id: string,
): Conversation | undefined {
  const row = db
    .select()
    .from(schema.conversations)
    .where(eq(schema.conversations.id, id))
    .get();
  if (!row) return undefined;
  return {
    id: row.id,
    phase: row.phase as ConversationPhase,
    resumeId: row.resumeId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function updateConversationPhase(
  db: Db,
  id: string,
  phase: ConversationPhase,
): void {
  db.update(schema.conversations)
    .set({ phase, updatedAt: new Date().toISOString() })
    .where(eq(schema.conversations.id, id))
    .run();
}

export function createMessage(
  db: Db,
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  metadata: Record<string, unknown> | null = null,
): Message {
  const row = {
    id: uuid(),
    conversationId,
    role,
    content,
    metadata,
    createdAt: new Date().toISOString(),
  };
  db.insert(schema.messages).values(row).run();
  return row;
}

export function getMessagesByConversation(
  db: Db,
  conversationId: string,
): Message[] {
  const rows = db
    .select()
    .from(schema.messages)
    .where(eq(schema.messages.conversationId, conversationId))
    .all();
  return rows.map((r) => ({
    id: r.id,
    conversationId: r.conversationId,
    role: r.role as "user" | "assistant",
    content: r.content,
    metadata: r.metadata as Record<string, unknown> | null,
    createdAt: r.createdAt,
  }));
}

export function createResume(
  db: Db,
  conversationId: string,
  fileName: string,
  fileType: "pdf" | "docx",
  rawText: string,
  parsedData: ResumeData | null,
): Resume {
  const row = {
    id: uuid(),
    conversationId,
    fileName,
    fileType,
    rawText,
    parsedData: parsedData as Record<string, unknown> | null,
    createdAt: new Date().toISOString(),
  };
  db.insert(schema.resumes).values(row).run();
  return {
    ...row,
    parsedData: parsedData,
  };
}

export function getResumeByConversation(
  db: Db,
  conversationId: string,
): Resume | undefined {
  const row = db
    .select()
    .from(schema.resumes)
    .where(eq(schema.resumes.conversationId, conversationId))
    .get();
  if (!row) return undefined;
  return {
    id: row.id,
    conversationId: row.conversationId,
    fileName: row.fileName,
    fileType: row.fileType as "pdf" | "docx",
    rawText: row.rawText,
    parsedData: row.parsedData as ResumeData | null,
    createdAt: row.createdAt,
  };
}

export function createSite(
  db: Db,
  conversationId: string,
  slug: string,
  profileData: ProfileData,
  templateId: string,
  html: string,
  css: string,
  personalityApplied: boolean = false,
): Site {
  const row = {
    id: uuid(),
    conversationId,
    slug,
    profileData: profileData as unknown as Record<string, unknown>,
    templateId,
    html,
    css,
    personalityApplied,
    createdAt: new Date().toISOString(),
  };
  db.insert(schema.sites).values(row).run();
  return {
    ...row,
    profileData,
  };
}

export function getSiteById(db: Db, id: string): Site | undefined {
  const row = db
    .select()
    .from(schema.sites)
    .where(eq(schema.sites.id, id))
    .get();
  if (!row) return undefined;
  return {
    id: row.id,
    conversationId: row.conversationId,
    slug: row.slug,
    profileData: row.profileData as unknown as ProfileData,
    templateId: row.templateId,
    html: row.html,
    css: row.css,
    personalityApplied: row.personalityApplied,
    createdAt: row.createdAt,
  };
}

export function getSiteBySlug(db: Db, slug: string): Site | undefined {
  const row = db
    .select()
    .from(schema.sites)
    .where(eq(schema.sites.slug, slug))
    .get();
  if (!row) return undefined;
  return {
    id: row.id,
    conversationId: row.conversationId,
    slug: row.slug,
    profileData: row.profileData as unknown as ProfileData,
    templateId: row.templateId,
    html: row.html,
    css: row.css,
    personalityApplied: row.personalityApplied,
    createdAt: row.createdAt,
  };
}

export function getSiteByConversation(
  db: Db,
  conversationId: string,
): Site | undefined {
  const row = db
    .select()
    .from(schema.sites)
    .where(eq(schema.sites.conversationId, conversationId))
    .get();
  if (!row) return undefined;
  return {
    id: row.id,
    conversationId: row.conversationId,
    slug: row.slug,
    profileData: row.profileData as unknown as ProfileData,
    templateId: row.templateId,
    html: row.html,
    css: row.css,
    personalityApplied: row.personalityApplied,
    createdAt: row.createdAt,
  };
}
