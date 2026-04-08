import Database from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

let db: BetterSQLite3Database<typeof schema> | null = null;

/** Get or create the database singleton. Pass a custom path for testing. */
export function getDb(
  dbPath: string = "./sqlite.db",
): BetterSQLite3Database<typeof schema> {
  if (!db) {
    const sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    db = drizzle(sqlite, { schema });
  }
  return db;
}

/** Create an in-memory database for testing. Returns a fresh instance each call. */
export function createTestDb(): BetterSQLite3Database<typeof schema> {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  const testDb = drizzle(sqlite, { schema });

  // Create tables
  sqlite.exec(`
    CREATE TABLE conversations (
      id TEXT PRIMARY KEY,
      phase TEXT NOT NULL DEFAULT 'discovery',
      resume_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id),
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX messages_conversation_idx ON messages(conversation_id);

    CREATE TABLE resumes (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id),
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      raw_text TEXT NOT NULL DEFAULT '',
      parsed_data TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX resumes_conversation_idx ON resumes(conversation_id);

    CREATE TABLE sites (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id),
      slug TEXT NOT NULL UNIQUE,
      profile_data TEXT NOT NULL,
      template_id TEXT NOT NULL,
      html TEXT NOT NULL,
      css TEXT NOT NULL,
      personality_applied INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE INDEX sites_conversation_idx ON sites(conversation_id);
    CREATE INDEX sites_slug_idx ON sites(slug);
  `);

  return testDb;
}

/** Reset the singleton (for testing). */
export function resetDb(): void {
  db = null;
}
