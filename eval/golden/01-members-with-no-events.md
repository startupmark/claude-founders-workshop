Add a `membersWithNoEvents` metric to `lib/stats.ts`: a count of members who
have zero events. Follow the existing style of the other metric helpers (a small
pure function that takes plain arrays and returns a number).
