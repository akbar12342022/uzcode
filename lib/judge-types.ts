import type { SubmissionStatus } from "@/lib/generated/prisma/enums";

// Shapes shared by the judge Server Functions and the workspace UI.

/** Final outcome of running a program against one test. */
export type Verdict = Exclude<SubmissionStatus, "PENDING">;

/** "run" checks the sample tests only; "submit" checks every test. */
export type JudgeMode = "run" | "submit";

export type TestOutcome = {
  verdict: Verdict;
  timeMs: number | null;
  memoryKb: number | null;
  /** Only sample tests carry their data; hidden tests stay on the server. */
  details: {
    input: string;
    expectedOutput: string;
    stdout: string;
    stderr: string;
  } | null;
};

export type JudgeReport = {
  mode: JudgeMode;
  /** The first failing test's verdict, or ACCEPTED when every test passed. */
  verdict: Verdict;
  passed: number;
  total: number;
  /** Compiler output when the code did not compile, otherwise empty. */
  compileOutput: string;
  tests: TestOutcome[];
};

export type JudgeResponse =
  | { ok: true; report: JudgeReport }
  | { ok: false; message: string };
