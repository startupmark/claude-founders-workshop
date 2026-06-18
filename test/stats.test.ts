import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { describe, it, expect } from "vitest";
import * as schema from "@/db/schema";
import { members, events } from "@/db/schema";
import { applyMigrations } from "@/db/migrate";
import { totalMembers, totalEvents, averageEventsPerMember } from "@/lib/stats";

// Hermetic: a fresh in-memory database per call, with migrations applied.
function freshDb() {
  const db = drizzle(new Database(":memory:"), { schema });
  applyMigrations(db);
  return db;
}

describe("stats", () => {
  it("computes the three metrics on happy-path data", () => {
    const db = freshDb();

    const inserted = db
      .insert(members)
      .values([
        { name: "Member A", joinedAt: new Date("2026-01-01T00:00:00Z") },
        { name: "Member B", joinedAt: new Date("2026-01-02T00:00:00Z") },
      ])
      .returning()
      .all();

    db.insert(events)
      .values([
        { memberId: inserted[0].id, type: "join", createdAt: new Date("2026-01-03T00:00:00Z") },
        { memberId: inserted[0].id, type: "post", createdAt: new Date("2026-01-04T00:00:00Z") },
        { memberId: inserted[1].id, type: "join", createdAt: new Date("2026-01-05T00:00:00Z") },
        { memberId: inserted[1].id, type: "rsvp", createdAt: new Date("2026-01-06T00:00:00Z") },
      ])
      .run();

    const m = db.select().from(members).all();
    const e = db.select().from(events).all();

    expect(totalMembers(m)).toBe(2);
    expect(totalEvents(e)).toBe(4);
    expect(averageEventsPerMember(m, e)).toBe(2);
  });
});
