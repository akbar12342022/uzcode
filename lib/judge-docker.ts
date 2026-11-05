import "server-only";

import { spawn } from "node:child_process";
import {
  JudgeError,
  type JudgeRequest,
  type JudgeResult,
} from "@/lib/judge-core";

/**
 * Runs a solution in a throwaway Docker container on this machine.
 *
 * This is the default engine: it needs no account, no API key and no request
 * quota, which matters while the problem set is being written. lib/judge0.ts
 * remains for a hosted Judge0 instance — see lib/judge.ts for the switch.
 *
 * The job goes in on stdin and the report comes back on stdout, so the
 * container needs no mounts. Everything a submission could reach is closed
 * off: no network, no capabilities, no writable filesystem except a small
 * tmpfs, and caps on memory, CPU and process count.
 */
export const JUDGE_IMAGE = "uzcode-judge:1";

const CONTAINER_FLAGS = [
  "--rm",
  "--interactive",
  "--network", "none",
  "--memory", "320m",
  "--memory-swap", "320m",
  "--cpus", "1",
  "--pids-limit", "128",
  "--read-only",
  // Compiling and running both happen here; exec is what lets the C++ binary
  // start, and the size cap stops a program filling memory through the disk.
  "--tmpfs", "/tmp:rw,exec,size=96m",
  "--cap-drop", "ALL",
  "--security-opt", "no-new-privileges",
];

/** Container start, compilation and the gap between tests. */
const OVERHEAD_MS = 25_000;
const MAX_STDOUT_BYTES = 4 * 1024 * 1024;

type DriverReport =
  | { ok: true; results: JudgeResult[] }
  | { ok: false; message: string };

function describe(stderr: string): JudgeError {
  const text = stderr.toLowerCase();
  if (text.includes("no such image") || text.includes("unable to find image")) {
    return new JudgeError(
      "ENGINE_MISSING",
      "sandbox image missing; run: npm run judge:build",
    );
  }
  if (
    text.includes("cannot connect to the docker daemon") ||
    text.includes("docker daemon is not running") ||
    text.includes("the system cannot find the file")
  ) {
    return new JudgeError("ENGINE_MISSING", "docker is not running");
  }
  return new JudgeError("UNAVAILABLE", stderr.slice(0, 500) || "docker failed");
}

export async function judgeWithDocker(
  request: JudgeRequest,
): Promise<JudgeResult[]> {
  const budgetMs =
    OVERHEAD_MS + request.tests.length * (request.timeLimitMs + 1000);

  const report = await new Promise<DriverReport>((resolve, reject) => {
    const child = spawn("docker", ["run", ...CONTAINER_FLAGS, JUDGE_IMAGE], {
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const finish = (outcome: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      outcome();
    };

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      finish(() => reject(new JudgeError("TIMEOUT")));
    }, budgetMs);

    child.stdout.on("data", (chunk: Buffer) => {
      if (stdout.length < MAX_STDOUT_BYTES) stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      if (stderr.length < 64_000) stderr += chunk.toString("utf8");
    });

    // ENOENT here means the docker CLI itself is missing from PATH.
    child.on("error", (error) =>
      finish(() => reject(describe(String(error)))),
    );

    child.on("close", (code) =>
      finish(() => {
        if (code !== 0) {
          reject(describe(stderr));
          return;
        }
        try {
          resolve(JSON.parse(stdout.trim()) as DriverReport);
        } catch {
          reject(
            new JudgeError(
              "UNAVAILABLE",
              `unparsable driver output: ${stdout.slice(0, 300)}`,
            ),
          );
        }
      }),
    );

    child.stdin.on("error", () => {});
    child.stdin.end(
      JSON.stringify({
        language: request.language,
        sourceCode: request.sourceCode,
        timeLimitMs: request.timeLimitMs,
        tests: request.tests,
      }),
    );
  });

  if (!report.ok) throw new JudgeError("UNAVAILABLE", report.message);
  return report.results;
}
