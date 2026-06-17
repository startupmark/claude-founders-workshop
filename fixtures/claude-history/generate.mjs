// Generator for the synthetic Claude Code history fixture (Part 1 / ccusage).
//
// Run from the repo root:  node fixtures/claude-history/generate.mjs
//
// It emits the sibling *.jsonl session files with a deliberately unflattering
// cost/cache profile: ~30 days, an overall cache-hit near 40%, and two
// expensive, cache-poor Opus sessions that dominate cost. Every value is
// synthetic and obviously fake; task text is generic only. This is dev tooling
// for re-tuning the fixture, not a workshop fixture to leave broken.
import { mkdirSync, writeFileSync, readdirSync, rmSync } from "node:fs";

const OUT = "fixtures/claude-history";
const CWD = "/home/founder/acme-community";
const VERSION = "2.1.178";
const BRANCH = "main";

const MODEL = {
  opus: "claude-opus-4-8",
  sonnet: "claude-sonnet-4-6",
  haiku: "claude-haiku-4-5-20251001",
};

// Per-1M-token rates (USD), used only to precompute a coherent costUSD so the
// fixture shows a cost even if ccusage's pricing map lags a new model id.
const RATE = {
  [MODEL.opus]: { in: 15, out: 75, cw: 18.75, cr: 1.5 },
  [MODEL.sonnet]: { in: 3, out: 15, cw: 3.75, cr: 0.3 },
  [MODEL.haiku]: { in: 0.8, out: 4, cw: 1.0, cr: 0.08 },
};

const cost = (m, u) => {
  const r = RATE[m];
  return (
    (u.input_tokens * r.in +
      u.output_tokens * r.out +
      u.cache_creation_input_tokens * r.cw +
      u.cache_read_input_tokens * r.cr) /
    1_000_000
  );
};

// One session per entry. Dates span ~30 days ending 2026-06-16. Tasks are
// generic only. Turn = [input, output, cache_creation, cache_read].
const sessions = [
  { date: "2026-05-18", time: "09:12:40", model: "sonnet", task: "add a button to the members page",
    turns: [[1800, 2600, 7600, 6800], [900, 1400, 4200, 5200]] },
  { date: "2026-05-19", time: "14:05:11", model: "sonnet", task: "fix a typo in the header",
    turns: [[1200, 800, 5800, 4600]] },
  { date: "2026-05-21", time: "10:41:03", model: "haiku", task: "rename a variable",
    turns: [[700, 500, 2400, 3100], [400, 300, 1500, 2000]] },
  { date: "2026-05-23", time: "16:22:55", model: "sonnet", task: "add a loading state",
    turns: [[2100, 3000, 8200, 5400], [1300, 1800, 6100, 4800]] },
  { date: "2026-05-25", time: "11:08:19", model: "opus", task: "refactor the stats helpers",
    turns: [[16000, 21000, 42000, 9000], [12000, 18000, 38000, 11000], [9000, 14000, 30000, 8000]] },
  { date: "2026-05-27", time: "13:34:47", model: "sonnet", task: "tweak the card spacing",
    turns: [[1500, 1100, 6400, 5600]] },
  { date: "2026-05-29", time: "08:55:02", model: "haiku", task: "fix a typo in a comment",
    turns: [[500, 400, 1800, 2600]] },
  { date: "2026-06-01", time: "15:47:38", model: "sonnet", task: "add a members count label",
    turns: [[1900, 2400, 7800, 7000], [1100, 1500, 5200, 5800]] },
  { date: "2026-06-03", time: "10:19:24", model: "sonnet", task: "adjust the seed data",
    turns: [[1700, 2000, 6900, 6200]] },
  { date: "2026-06-05", time: "17:03:50", model: "opus", task: "investigate a flaky test",
    turns: [[18000, 24000, 45000, 10000], [14000, 19000, 40000, 12000], [11000, 16000, 33000, 9000]] },
  { date: "2026-06-08", time: "09:38:16", model: "sonnet", task: "add an empty-state message",
    turns: [[2000, 2700, 8000, 6600], [1200, 1600, 5600, 5000]] },
  { date: "2026-06-10", time: "12:50:33", model: "haiku", task: "rename a css class",
    turns: [[600, 450, 2100, 2800]] },
  { date: "2026-06-13", time: "14:27:09", model: "sonnet", task: "fix a formatting bug",
    turns: [[1600, 2200, 7100, 6400], [1000, 1300, 4900, 5400]] },
  { date: "2026-06-16", time: "10:02:58", model: "sonnet", task: "add a simple footer",
    turns: [[1400, 1900, 6200, 5800]] },
];

let n = 0;
const id = (p) => `${p}_synthetic_${String(++n).padStart(4, "0")}`;
let uuidN = 0;
const nextUuid = () => `00000000-0000-4000-8000-${String(++uuidN).padStart(12, "0")}`;
const sessionUuid = (i) => `${String(i).padStart(8, "0")}-0000-4000-8000-${String(i).padStart(12, "0")}`;

let totals = { cr: 0, cw: 0, costUSD: 0 };

mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(OUT)) {
  if (f.endsWith(".jsonl")) rmSync(`${OUT}/${f}`);
}

sessions.forEach((s, si) => {
  const sessionId = sessionUuid(si + 1);
  const model = MODEL[s.model];
  const lines = [];
  let prevUuid = null;

  // A user turn (generic task text). ccusage ignores lines with no usage.
  const userUuid = nextUuid();
  lines.push({
    parentUuid: prevUuid,
    isSidechain: false,
    userType: "external",
    type: "user",
    message: { role: "user", content: [{ type: "text", text: s.task }] },
    uuid: userUuid,
    timestamp: `${s.date}T${s.time}.000Z`,
    cwd: CWD,
    sessionId,
    version: VERSION,
    gitBranch: BRANCH,
  });
  prevUuid = userUuid;

  s.turns.forEach(([input, output, cw, cr], ti) => {
    // Keep Opus sessions cache-poor (the volatile-prefix story); lift the
    // cheaper sessions so the 30-day aggregate cache-hit lands near 40%.
    const readTokens = s.model === "opus" ? cr : Math.round((cr * 1.75) / 100) * 100;
    const usage = {
      input_tokens: input,
      cache_creation_input_tokens: cw,
      cache_read_input_tokens: readTokens,
      output_tokens: output,
      service_tier: "standard",
    };
    const costUSD = Number(cost(model, usage).toFixed(4));
    totals.cr += readTokens;
    totals.cw += cw;
    totals.costUSD += costUSD;

    const u = nextUuid();
    const ts = `${s.date}T${s.time}.${String(100 + ti).padStart(3, "0")}Z`;
    lines.push({
      parentUuid: prevUuid,
      isSidechain: false,
      userType: "external",
      type: "assistant",
      message: {
        id: id("msg"),
        type: "message",
        role: "assistant",
        model,
        content: [{ type: "text", text: "(synthetic assistant turn)" }],
        stop_reason: "end_turn",
        usage,
      },
      requestId: id("req"),
      uuid: u,
      timestamp: ts,
      costUSD,
      cwd: CWD,
      sessionId,
      version: VERSION,
      gitBranch: BRANCH,
    });
    prevUuid = u;
  });

  const file = `${OUT}/${s.date.replace(/-/g, "")}-${sessionId.slice(0, 8)}.jsonl`;
  writeFileSync(file, lines.map((l) => JSON.stringify(l)).join("\n") + "\n");
});

const hit = totals.cr / (totals.cr + totals.cw);
console.log(`Sessions: ${sessions.length}, files written to ${OUT}/`);
console.log(`Cache-hit rate: ${(hit * 100).toFixed(1)}%`);
console.log(`Total synthetic cost: $${totals.costUSD.toFixed(2)}`);
