import { db } from "@/db/client";
import { members as membersTable, events as eventsTable } from "@/db/schema";
import { totalMembers, totalEvents, averageEventsPerMember } from "@/lib/stats";
import { fmt } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function Page() {
  const members = db.select().from(membersTable).all();
  const events = db.select().from(eventsTable).all();

  const cards = [
    { label: "Total members", value: fmt(totalMembers(members)) },
    { label: "Total events", value: fmt(totalEvents(events)) },
    { label: "Avg events / member", value: fmt(averageEventsPerMember(members, events)) },
  ];

  return (
    <main>
      <h1>acme-community</h1>
      <section className="cards">
        {cards.map((card) => (
          <div className="card" key={card.label}>
            <div className="value">{card.value}</div>
            <div className="label">{card.label}</div>
          </div>
        ))}
      </section>
      <h2>Members</h2>
      <ul>
        {members.map((member) => (
          <li key={member.id}>{member.name}</li>
        ))}
      </ul>
    </main>
  );
}
