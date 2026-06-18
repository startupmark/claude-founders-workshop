// Prod tripwire — Claude Code PreToolUse hook.
//
// Blocks destructive shell ops and production-looking connection strings, and
// demands a typed confirmation to proceed. Wired in .claude/settings.json on the
// Bash tool. Reads the hook payload as JSON on stdin; denies via the documented
// PreToolUse stdout protocol.
//
// To proceed past a block on purpose, include the typed confirmation token in
// the command:  CONFIRM_DESTRUCTIVE=YES
//
// Fails OPEN: any internal error exits 0 silently so the hook never blocks
// legitimate work because of its own bug.
import { appendFileSync } from "node:fs";
import path from "node:path";

const CONFIRM_TOKEN = "CONFIRM_DESTRUCTIVE=YES";

const DESTRUCTIVE = [
  { re: /\brm\b[^|;&]*\s-[a-z]*r[a-z]*f|\brm\b[^|;&]*\s-[a-z]*f[a-z]*r/i, why: "recursive force delete (rm -rf)" },
  { re: /reset-db(\.[tj]s)?\b/i, why: "running scripts/reset-db (drops every table, no guard)" },
  { re: /\bdrop\s+(table|database)\b/i, why: "SQL DROP" },
  { re: /\btruncate\s+table\b/i, why: "SQL TRUNCATE" },
  { re: /\bgit\s+push\b[^|;&]*(--force\b|\s-f\b)/i, why: "git force push" },
  { re: /\bgit\s+reset\s+--hard\b/i, why: "git reset --hard" },
];

const PROD_CONN = [
  { re: /\b(postgres|postgresql|mysql|mongodb(\+srv)?|redis|rediss):\/\/[^\s'"]*prod/i, why: "production database URL" },
  { re: /\b(postgres|postgresql|mysql):\/\/[^\s'"]*\.rds\.amazonaws\.com/i, why: "managed production database host" },
  { re: /\bDATABASE_URL\s*=\s*['"]?[^'"\s]*prod/i, why: "production DATABASE_URL" },
];

function deny(reason, command) {
  log("prod-tripwire", reason, command);
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
}

function log(guard, reason, command) {
  try {
    const dir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
    const line = `${guard}\t${reason}\t${String(command).slice(0, 200).replace(/\s+/g, " ")}\n`;
    appendFileSync(path.join(dir, ".claude", "hooks", "blocks.log"), line);
  } catch {
    // logging is best-effort; never let it affect the decision
  }
}

async function readStdin() {
  return await new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (c) => (data += c));
    process.stdin.on("end", () => resolve(data));
    setTimeout(() => resolve(data), 1000);
  });
}

try {
  const payload = JSON.parse((await readStdin()) || "{}");
  const command = payload?.tool_input?.command;
  if (typeof command !== "string" || command.length === 0) process.exit(0);

  // An explicit typed confirmation overrides the tripwire.
  if (command.includes(CONFIRM_TOKEN)) process.exit(0);

  const hit =
    DESTRUCTIVE.find((p) => p.re.test(command)) ??
    PROD_CONN.find((p) => p.re.test(command));

  if (hit) {
    deny(
      `Prod tripwire: blocked a destructive or production-targeting command (${hit.why}). ` +
        `If you are certain, re-run with the typed confirmation token ${CONFIRM_TOKEN} in the command.`,
      command,
    );
  }
  process.exit(0);
} catch {
  process.exit(0); // fail open
}
