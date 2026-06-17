import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { members, events } from "./schema";
import * as schema from "./schema";

type Db = BetterSQLite3Database<typeof schema>;

// Synthetic, obviously-fake demo data: five members, fifteen events.
const seedMembers = [
  { name: "Member A", joinedAt: new Date("2026-01-01T00:00:00Z"), eventCount: 1 },
  { name: "Member B", joinedAt: new Date("2026-01-02T00:00:00Z"), eventCount: 2 },
  { name: "Member C", joinedAt: new Date("2026-01-03T00:00:00Z"), eventCount: 3 },
  { name: "Member D", joinedAt: new Date("2026-01-04T00:00:00Z"), eventCount: 4 },
  { name: "Member E", joinedAt: new Date("2026-01-05T00:00:00Z"), eventCount: 5 },
];

const eventTypes = ["join", "post", "rsvp", "comment"];

/** Insert demo data only if the members table is empty. */
export function seedIfEmpty(db: Db): void {
  const existing = db.select().from(members).all();
  if (existing.length > 0) return;

  const inserted = db
    .insert(members)
    .values(seedMembers.map(({ name, joinedAt }) => ({ name, joinedAt })))
    .returning()
    .all();

  const rows = inserted.flatMap((member, i) =>
    Array.from({ length: seedMembers[i].eventCount }, (_, j) => ({
      memberId: member.id,
      type: eventTypes[j % eventTypes.length],
      createdAt: new Date(`2026-02-${String(i + 1).padStart(2, "0")}T00:00:00Z`),
    })),
  );

  db.insert(events).values(rows).run();
}
