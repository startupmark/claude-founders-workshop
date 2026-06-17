import type { Member, Event } from "@/db/schema";

export function totalMembers(members: Member[]): number {
  return members.length;
}

export function totalEvents(events: Event[]): number {
  return events.length;
}

export function averageEventsPerMember(members: Member[], events: Event[]): number {
  return events.length / members.length;
}
