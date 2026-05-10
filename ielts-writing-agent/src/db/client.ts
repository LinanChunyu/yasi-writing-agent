import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import fs from "fs";
import * as schema from "./schema";

const DB_PATH = process.env.DATABASE_PATH ?? "./data/ielts.db";

function initDb() {
  const resolved = path.resolve(process.cwd(), DB_PATH);
  const dir = path.dirname(resolved);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const sqlite = new Database(resolved);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("synchronous = NORMAL");

  // Load sqlite-vec extension
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sqliteVec = require("sqlite-vec");
    sqliteVec.load(sqlite);
  } catch (e) {
    console.warn("sqlite-vec not available:", e);
  }

  return sqlite;
}

// Singleton for the process (Next.js hot reload safe)
const globalForDb = globalThis as unknown as {
  _sqliteDb: ReturnType<typeof Database> | undefined;
  _drizzleDb: ReturnType<typeof drizzle<typeof schema>> | undefined;
};

function getDb() {
  if (!globalForDb._sqliteDb) {
    globalForDb._sqliteDb = initDb();
  }
  if (!globalForDb._drizzleDb) {
    globalForDb._drizzleDb = drizzle(globalForDb._sqliteDb, { schema });
  }
  return globalForDb._drizzleDb;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle<typeof schema>>];
  },
});

export function getSqlite(): ReturnType<typeof Database> {
  getDb(); // ensure initialized
  return globalForDb._sqliteDb!;
}
