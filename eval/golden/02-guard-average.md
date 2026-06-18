Guard `averageEventsPerMember` in `lib/stats.ts` against an empty members list so
it does not divide by zero. With no members, it should return `0` rather than
`NaN`.
