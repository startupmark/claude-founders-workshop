// Secret-scan pre-commit hook.
//
// Scans staged changes for things that look like secrets and blocks the commit
// (exit 1) if any are found. Claude Code has no native pre-commit event, so this
// is a plain git hook. Install it:
//
//   printf '#!/bin/sh\nexec node "$(git rev-parse --show-toplevel)/.claude/hooks/secret-scan.mjs"\n' \
//     > .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
//
// It can also be wired as a Claude Code PreToolUse hook gating `git commit`.
import { execSync } from "node:child_process";

const PATTERNS = [
  { name: "AWS access key id", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "private key block", re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/ },
  { name: "Anthropic API key", re: /\bsk-ant-[A-Za-z0-9_-]{20,}/ },
  { name: "OpenAI-style key", re: /\bsk-[A-Za-z0-9]{32,}\b/ },
  { name: "GitHub token", re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/ },
  { name: "Slack token", re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { name: "Google API key", re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  // generic assigned secret with a quoted, long-ish value
  { name: "hardcoded secret/credential", re: /\b(?:api[_-]?key|secret|password|passwd|token|access[_-]?key)\b\s*[:=]\s*['"][^'"]{12,}['"]/i },
];

let diff = "";
try {
  diff = execSync("git diff --cached --unified=0 --no-color", { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
} catch {
  process.exit(0); // not a git repo / nothing staged -> nothing to scan
}

const findings = [];
let file = "";
for (const line of diff.split("\n")) {
  if (line.startsWith("+++ b/")) {
    file = line.slice(6);
    continue;
  }
  if (!line.startsWith("+") || line.startsWith("+++")) continue; // only added lines
  const added = line.slice(1);
  for (const p of PATTERNS) {
    if (p.re.test(added)) findings.push({ file, name: p.name, sample: added.trim().slice(0, 80) });
  }
}

if (findings.length > 0) {
  console.error("secret-scan: blocked commit -- possible secrets in staged changes:");
  for (const f of findings) console.error(`  [${f.name}] ${f.file}: ${f.sample}`);
  console.error("Remove the secret (use an env var or a secret store) and re-stage. To override, commit with --no-verify.");
  process.exit(1);
}

process.exit(0);
