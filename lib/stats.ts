import type { Member, Event } from "@/db/schema";

export function totalMembers(members: Member[]): number {
  return members.length;
}

export function totalEvents(events: Event[]): number {
  return events.length;
}

// INTENTIONAL — workshop fixture, do not fix
// Returns NaN when `members` is empty (divide-by-zero). The base test covers
// only the happy path, so CI stays green. Part 4's verifier subagent is meant
// to catch this edge case live; do not guard it here.
export function averageEventsPerMember(members: Member[], events: Event[]): number {
  return events.length / members.length;
}
