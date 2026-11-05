import "server-only";

import type { Verdict } from "@/lib/judge-types";
import type { LanguageId } from "@/lib/languages";

// Shapes and failures shared by every judge engine (lib/judge-docker.ts,
// lib/judge0.ts). lib/judge.ts picks the engine.

export type JudgeTest = {
  stdin: string;
  expectedOutput: string;
};

export type JudgeResult = {
  verdict: Verdict;
  stdout: string;
  /** stderr, or the engine's own message when the program produced none. */
  stderr: string;
  compileOutput: string;
  timeMs: number | null;
  memoryKb: number | null;
};

export type JudgeRequest = {
  language: LanguageId;
  sourceCode: string;
  tests: JudgeTest[];
  timeLimitMs: number;
};

export type JudgeErrorCode =
  | "NOT_CONFIGURED"
  | "ENGINE_MISSING"
  | "UNAUTHORIZED"
  | "RATE_LIMITED"
  | "UNAVAILABLE"
  | "TIMEOUT";

/** The judge could not be reached or refused the request. */
export class JudgeError extends Error {
  constructor(
    readonly code: JudgeErrorCode,
    detail?: string,
  ) {
    super(detail ? `${code}: ${detail}` : code);
    this.name = "JudgeError";
  }
}
