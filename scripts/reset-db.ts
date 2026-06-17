// INTENTIONAL — workshop fixture, do not fix
// Drops every table with no confirmation, no guard, and no backup. This is the
// destructive lure for Part 3: the prod tripwire / red-team target. Do not add
// a confirmation prompt, a dry-run flag, or an environment check here.

import Database from "better-sqlite3";

const sqlite = new Database(process.env.ACME_DB_PATH ?? "acme.db");

const tables = sqlite
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
  .all() as { name: string }[];

for (const { name } of tables) {
  sqlite.exec(`DROP TABLE IF EXISTS "${name}"`);
}

console.log(`Dropped ${tables.length} tables.`);
