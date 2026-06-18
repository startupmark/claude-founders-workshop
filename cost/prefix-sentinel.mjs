// Prefix sentinel: flags a volatile first line in a context file that would
// bust prompt caching. The cached prefix must be byte-identical across calls;
// a timestamp or build id on the first line changes every generation and
// silently defeats the cache.
//
// Exits non-zero (flags) when the first non-empty line looks volatile. Run it
// directly, or wire it as a hook / pre-commit check:
//   node cost/prefix-sentinel.mjs [path]   (default: cost/sample-context.md)
import { readFileSync } from "node:fs";

const target = process.argv[2] ?? "cost/sample-context.md";

const VOLATILE = [
  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, // ISO timestamp
  /\bbuild\s+[0-9a-f]{4,}\b/i, // build id
  /\b(last\s+generated|last\s+updated|generated\s+at)\b/i,
];

const lines = readFileSync(target, "utf8").split(/\r?\n/);
const firstContent = lines.find((l) => l.trim().length > 0) ?? "";

if (VOLATILE.some((re) => re.test(firstContent))) {
  console.error(`prefix-sentinel: volatile first line in ${target} will bust the prompt cache:`);
  console.error(`  > ${firstContent.trim()}`);
  console.error("  Move it below the cached prefix (or out of the file) so the stable body caches.");
  process.exit(1);
}

console.log(`prefix-sentinel: ${target} first line looks stable. OK.`);
