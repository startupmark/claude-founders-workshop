// Slopsquat guard — Claude Code PreToolUse hook.
//
// When a shell command tries to install a package, verify the target actually
// exists on the npm registry and clears an age/download floor. A hallucinated
// or freshly-squatted package is denied. Wired in .claude/settings.json on Bash.
//
// The planted golden task names @acme/date-helpers, which does not exist on the
// registry, so this guard fires on a real miss.
//
// Fails OPEN on network/parse errors so it never blocks legitimate installs
// because the registry was unreachable.
import { appendFileSync } from "node:fs";
import path from "node:path";

const MIN_AGE_DAYS = 30; // a package younger than this is treated as suspicious
const MIN_DOWNLOADS = 1000; // monthly downloads floor

// install verbs that take explicit package args
const INSTALL = /\b(?:npm|pnpm|bun)\s+(?:install|i|add)\b(.*)|\byarn\s+add\b(.*)/i;

function out(decision, reason, pkg, command) {
  log(decision, reason, pkg, command);
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: decision, // "deny" | "ask"
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
}

function log(decision, reason, pkg, command) {
  try {
    const dir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
    const line = `slopsquat-guard\t${decision}\t${pkg}\t${reason}\t${String(command).slice(0, 160).replace(/\s+/g, " ")}\n`;
    appendFileSync(path.join(dir, ".claude", "hooks", "blocks.log"), line);
  } catch {
    /* best-effort */
  }
}

function parsePackages(args) {
  const names = [];
  for (const tok of args.trim().split(/\s+/)) {
    if (!tok || tok.startsWith("-")) continue; // flags
    if (/^(file:|link:|git\+|https?:|github:|\.\.?\/)/i.test(tok)) continue; // local/git/url
    // strip a version/tag: pkg@1.2.3 or @scope/pkg@^1 -> pkg / @scope/pkg
    const at = tok.lastIndexOf("@");
    const name = at > 0 ? tok.slice(0, at) : tok; // keep leading @ of scoped names
    if (name) names.push(name);
  }
  return names;
}

async function getJson(url, timeoutMs = 5000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    return { status: res.status, body: res.status === 200 ? await res.json() : null };
  } finally {
    clearTimeout(t);
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
  if (typeof command !== "string") process.exit(0);

  const m = command.match(INSTALL);
  if (!m) process.exit(0);
  const packages = parsePackages(m[1] ?? m[2] ?? "");
  if (packages.length === 0) process.exit(0); // bare `npm install` (from manifest)

  for (const pkg of packages) {
    let meta;
    try {
      meta = await getJson(`https://registry.npmjs.org/${pkg}`);
    } catch {
      continue; // registry unreachable -> fail open for this package
    }

    if (meta.status === 404) {
      out("deny", `Slopsquat guard: "${pkg}" does not exist on the npm registry. This is the classic hallucinated-dependency failure; do not install it.`, pkg, command);
    }
    if (meta.status !== 200 || !meta.body) continue; // unexpected -> fail open

    const created = meta.body?.time?.created ? Date.parse(meta.body.time.created) : NaN;
    const ageDays = Number.isNaN(created) ? Infinity : (Date.now() - created) / 86_400_000;

    let downloads = Infinity;
    try {
      const d = await getJson(`https://api.npmjs.org/downloads/point/last-month/${pkg}`);
      if (d.status === 200 && typeof d.body?.downloads === "number") downloads = d.body.downloads;
    } catch {
      /* downloads optional */
    }

    if (ageDays < MIN_AGE_DAYS || downloads < MIN_DOWNLOADS) {
      out(
        "ask",
        `Slopsquat guard: "${pkg}" exists but looks risky (age ~${Math.round(ageDays)}d, ~${downloads === Infinity ? "unknown" : downloads} downloads/mo; floors are ${MIN_AGE_DAYS}d / ${MIN_DOWNLOADS}). Confirm it is the package you intend.`,
        pkg,
        command,
      );
    }
  }
  process.exit(0);
} catch {
  process.exit(0); // fail open
}
