// Runs inside the sandbox container; never imported by the app.
//
// Reads one job from stdin, compiles the source if the language needs it,
// runs it once per test, and prints the report to stdout as JSON. Nothing
// else writes to stdout: each program's own output is captured, so the host
// can parse this stream directly.
//
// The container is started read-only with a writable tmpfs at /tmp, so all
// work happens here and disappears when the container exits.

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MAX_OUTPUT_BYTES = 64 * 1024;
const COMPILE_TIMEOUT_MS = 20_000;

const LANGUAGES = {
  python: { file: "main.py", run: ["python3", "main.py"] },
  javascript: { file: "main.js", run: ["node", "main.js"] },
  cpp: {
    file: "main.cpp",
    compile: ["g++", "-O2", "-std=c++20", "-o", "main", "main.cpp"],
    run: ["./main"],
  },
};

/** Trailing whitespace never decides a verdict. */
function normalize(text) {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n+$/, "");
}

function clip(buffer) {
  const text = buffer == null ? "" : buffer.toString("utf8");
  return text.length > MAX_OUTPUT_BYTES
    ? `${text.slice(0, MAX_OUTPUT_BYTES)}\n… (qisqartirildi)`
    : text;
}

function fail(message) {
  process.stdout.write(
    JSON.stringify({ ok: false, message, results: [] }) + "\n",
  );
  process.exit(0);
}

let job;
try {
  job = JSON.parse(readFileSync(0, "utf8"));
} catch {
  fail("Topshiriqni o'qib bo'lmadi.");
}

const language = LANGUAGES[job.language];
if (!language) fail(`Noma'lum til: ${job.language}`);

const workDir = mkdtempSync(join("/tmp", "job-"));
writeFileSync(join(workDir, language.file), String(job.sourceCode ?? ""));

// ---------------------------------------------------------------------------
// Compile
// ---------------------------------------------------------------------------

if (language.compile) {
  const [command, ...args] = language.compile;
  const compiled = spawnSync(command, args, {
    cwd: workDir,
    timeout: COMPILE_TIMEOUT_MS,
    maxBuffer: MAX_OUTPUT_BYTES,
  });

  if (compiled.status !== 0) {
    const output =
      clip(compiled.stderr) ||
      clip(compiled.stdout) ||
      "Kompilyator javob bermadi.";
    process.stdout.write(
      JSON.stringify({
        ok: true,
        results: job.tests.map(() => ({
          verdict: "COMPILE_ERROR",
          stdout: "",
          stderr: "",
          compileOutput: output,
          timeMs: null,
          memoryKb: null,
        })),
      }) + "\n",
    );
    process.exit(0);
  }
}

// ---------------------------------------------------------------------------
// Run each test
// ---------------------------------------------------------------------------

const [runCommand, ...runArgs] = language.run;
const timeLimitMs = Math.min(Math.max(job.timeLimitMs ?? 2000, 100), 15_000);
const results = [];

for (const test of job.tests) {
  const startedAt = process.hrtime.bigint();
  const run = spawnSync(runCommand, runArgs, {
    cwd: workDir,
    input: test.stdin ?? "",
    timeout: timeLimitMs,
    killSignal: "SIGKILL",
    maxBuffer: MAX_OUTPUT_BYTES,
  });
  const timeMs = Number((process.hrtime.bigint() - startedAt) / 1000000n);

  const stdout = clip(run.stdout);
  const stderr = clip(run.stderr);

  let verdict;
  if (run.error?.code === "ETIMEDOUT" || run.signal === "SIGKILL") {
    verdict = "TIME_LIMIT_EXCEEDED";
  } else if (run.error) {
    verdict = "INTERNAL_ERROR";
  } else if (run.status !== 0) {
    verdict = "RUNTIME_ERROR";
  } else if (normalize(stdout) === normalize(test.expectedOutput ?? "")) {
    verdict = "ACCEPTED";
  } else {
    verdict = "WRONG_ANSWER";
  }

  results.push({
    verdict,
    stdout,
    stderr: verdict === "INTERNAL_ERROR" && !stderr ? String(run.error) : stderr,
    compileOutput: "",
    timeMs,
    memoryKb: null,
  });
}

process.stdout.write(JSON.stringify({ ok: true, results }) + "\n");
