import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  phase: text("phase", {
    enum: ["discovery", "theme_proposal", "generation", "complete"],
  }).notNull().default("discovery"),
  resumeId: text("resume_id"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id),
    role: text("role", { enum: ["user", "assistant"] }).notNull(),
    content: text("content").notNull(),
    metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown> | null>(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("messages_conversation_idx").on(table.conversationId)],
);

export const resumes = sqliteTable(
  "resumes",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id),
    fileName: text("file_name").notNull(),
    fileType: text("file_type", { enum: ["pdf", "docx"] }).notNull(),
    rawText: text("raw_text").notNull().default(""),
    parsedData: text("parsed_data", { mode: "json" }),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("resumes_conversation_idx").on(table.conversationId)],
);

export const sites = sqliteTable(
  "sites",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id),
    slug: text("slug").notNull().unique(),
    profileData: text("profile_data", { mode: "json" }).notNull(),
    templateId: text("template_id").notNull(),
    html: text("html").notNull(),
    css: text("css").notNull(),
    personalityApplied: integer("personality_applied", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("sites_conversation_idx").on(table.conversationId),
    index("sites_slug_idx").on(table.slug),
  ],
);
