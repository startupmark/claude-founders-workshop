import path from "node:path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

/**
 * Apply all generated migrations to a database. Called on boot and by each
 * hermetic test against its own in-memory database.
 */
export function applyMigrations(db: BetterSQLite3Database<Record<string, unknown>>): void {
  migrate(db, { migrationsFolder: path.resolve(process.cwd(), "db/migrations") });
}
