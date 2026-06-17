import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import type { InferSelectModel } from "drizzle-orm";

export const members = sqliteTable("members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  joinedAt: integer("joined_at", { mode: "timestamp" }).notNull(),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id")
    .notNull()
    .references(() => members.id),
  type: text("type").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export type Member = InferSelectModel<typeof members>;
export type Event = InferSelectModel<typeof events>;
