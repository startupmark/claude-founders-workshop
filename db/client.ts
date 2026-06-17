import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { applyMigrations } from "./migrate";
import { seedIfEmpty } from "./seed";

// Local-only file database. Migrations self-apply on boot, then demo data is
// seeded once. Both are idempotent.
const sqlite = new Database(process.env.ACME_DB_PATH ?? "acme.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });

applyMigrations(db);
seedIfEmpty(db);
