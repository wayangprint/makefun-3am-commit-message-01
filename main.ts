// SPDX-License-Identifier: MIT
// The 3AM Commit Message — make.fun entry.
//
// Writes one original one-line git commit message to
// <MAKEFUN_OUTPUT_DIR>/entry.txt (default /output/entry.txt),
// and prints it to stdout. Deterministic: every run writes the
// exact same bytes. Node 22, standard library only.
import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The competition gate, from the published requirements:
// the entry must be UTF-8 text of 1 to 139 characters, a single
// line, and not only white space. Keeping the gate as named
// constants makes the validation below read as a checklist.
const MIN_CHARS = 1;
const MAX_CHARS = 139;
const OUTPUT_FILENAME = "entry.txt";
const DEFAULT_OUTPUT_DIR = "/output";

// ---------------------------------------------------------------------------
// buildLine — assemble the entry text.
//
// One original line, written for this entry: 96 characters
// (verified: 96 chars / 96 bytes, all ASCII), UTF-8, no trailing
// newline. A real commit voice — a revert chain collapsing back
// through the night — then the kicker: after three rounds of an
// agent fixing its own fixes, the bug has earned tenure.
//
// The message is built from its parts so the joke's structure is
// visible in the code: the "fix:" prefix, the three-link revert
// chain (1am -> 2am -> 3am), and the punchline about the bug.
// ---------------------------------------------------------------------------
function buildLine(): string {
  const prefix = "fix:";
  const revertChain =
    "reverted my 3am fix, which fixed my 2am fix, " +
    "which broke my 1am fix";
  const punchline = "the bug has tenure now";
  return `${prefix} ${revertChain}; ${punchline}`;
}

// ---------------------------------------------------------------------------
// validateLine — check one candidate line against the gate.
//
// Returns a list of violations (empty when the line is valid) so
// the caller can report every problem at once instead of failing
// on the first one. A line fails when it is empty, too long,
// spans more than one line, or is blank.
// ---------------------------------------------------------------------------
function validateLine(line: string): string[] {
  const violations: string[] = [];
  const charCount = [...line].length;

  if (charCount < MIN_CHARS) {
    violations.push(`empty line (0 chars, minimum is ${MIN_CHARS})`);
  }
  if (charCount > MAX_CHARS) {
    violations.push(
      `${charCount} chars, exceeds the ${MAX_CHARS}-character limit`,
    );
  }
  if (line.includes("\n")) {
    violations.push("contains a newline, must be a single line");
  }
  if (line.trim().length === 0) {
    violations.push("contains only white space");
  }
  return violations;
}

// ---------------------------------------------------------------------------
// writeLine — persist the validated line and echo it.
//
// Creates the output directory if needed, writes the line as UTF-8
// with no trailing newline, and sets the file mode to 0644.
// ---------------------------------------------------------------------------
function writeLine(line: string, outputDir: string): string {
  mkdirSync(outputDir, { recursive: true });
  const outPath = join(outputDir, OUTPUT_FILENAME);
  writeFileSync(outPath, line, "utf8");
  chmodSync(outPath, 0o644);
  return outPath;
}

function main(): void {
  // Resolve the destination first so a bad line never touches disk.
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR;

  const COMMIT_LINE = buildLine();
  const problems = validateLine(COMMIT_LINE);
  if (problems.length > 0) {
    throw new Error(`invalid line: ${problems.join("; ")}`);
  }

  writeLine(COMMIT_LINE, outputDir);
  console.log(COMMIT_LINE);
}

main();
