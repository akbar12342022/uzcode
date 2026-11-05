"use server";

import { z } from "zod";
import type {
  JudgeMode,
  JudgeReport,
  JudgeResponse,
} from "@/lib/judge-types";
import { judge } from "@/lib/judge";
import {
  JudgeError,
  type JudgeErrorCode,
  type JudgeResult,
} from "@/lib/judge-core";
import { LANGUAGES, type LanguageId } from "@/lib/languages";
import { getProblemForJudging } from "@/lib/problems";

const MAX_CODE_LENGTH = 64_000;
const MAX_OUTPUT_LENGTH = 8_000;

const LANGUAGE_IDS = LANGUAGES.map(({ id }) => id) as [
  LanguageId,
  ...LanguageId[],
];

// Server Functions are public endpoints: never trust the arguments.
const inputSchema = z.object({
  slug: z.string().min(1).max(200),
  language: z.enum(LANGUAGE_IDS),
  code: z
    .string()
    .max(MAX_CODE_LENGTH)
    .refine((code) => code.trim().length > 0),
});

const ERROR_MESSAGES: Record<JudgeErrorCode, string> = {
  NOT_CONFIGURED:
    "Tekshiruv tizimi sozlanmagan: .env faylida JUDGE0_URL va JUDGE0_RAPIDAPI_KEY ni to'ldiring.",
  ENGINE_MISSING:
    "Tekshiruvchi tayyor emas. Docker Desktop ochiq ekaniga ishonch hosil qiling, so'ng `npm run judge:build` ni ishga tushiring.",
  UNAUTHORIZED:
    "Tekshiruv tizimi kalitni qabul qilmadi: JUDGE0_RAPIDAPI_KEY ni va Judge0 CE obunasini tekshiring.",
  RATE_LIMITED:
    "Tekshiruvlar limiti tugadi. Birozdan so'ng qayta urinib ko'ring.",
  UNAVAILABLE:
    "Tekshiruv tizimi javob bermadi. Birozdan so'ng qayta urinib ko'ring.",
  TIMEOUT: "Tekshiruv juda uzoq davom etdi. Qayta urinib ko'ring.",
};

// A program can print megabytes; the browser only needs the beginning.
function clip(text: string) {
  return text.length > MAX_OUTPUT_LENGTH
    ? `${text.slice(0, MAX_OUTPUT_LENGTH)}\n… (qisqartirildi)`
    : text;
}

type JudgedTest = { input: string; expectedOutput: string; isSample: boolean };

function buildReport(
  mode: JudgeMode,
  tests: JudgedTest[],
  results: JudgeResult[],
): JudgeReport {
  const failure = results.find(({ verdict }) => verdict !== "ACCEPTED");
  const compileError = results.find(
    ({ verdict }) => verdict === "COMPILE_ERROR",
  );

  return {
    mode,
    verdict: failure?.verdict ?? "ACCEPTED",
    passed: results.filter(({ verdict }) => verdict === "ACCEPTED").length,
    total: results.length,
    compileOutput: clip(compileError?.compileOutput ?? ""),
    tests: results.map((result, index) => {
      const test = tests[index];
      return {
        verdict: result.verdict,
        timeMs: result.timeMs,
        memoryKb: result.memoryKb,
        // A program can echo its input, so output of a hidden test would
        // leak that test. Only sample tests send their data back.
        details: test.isSample
          ? {
              input: test.input,
              expectedOutput: test.expectedOutput,
              stdout: clip(result.stdout),
              stderr: clip(result.stderr),
            }
          : null,
      };
    }),
  };
}

async function judgeSolution(
  mode: JudgeMode,
  input: unknown,
): Promise<JudgeResponse> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Kod bo'sh yoki juda uzun (64 000 belgidan oshmasin).",
    };
  }
  const { slug, language: languageId, code } = parsed.data;

  const problem = await getProblemForJudging(slug);
  if (!problem) return { ok: false, message: "Masala topilmadi." };

  const tests =
    mode === "run"
      ? problem.testCases.filter((test) => test.isSample)
      : problem.testCases;
  if (tests.length === 0) {
    return { ok: false, message: "Bu masala uchun test yo'q." };
  }

  const language = LANGUAGES.find(({ id }) => id === languageId)!;

  try {
    const results = await judge({
      language: language.id,
      sourceCode: code,
      tests: tests.map((test) => ({
        stdin: test.input,
        expectedOutput: test.expectedOutput,
      })),
      timeLimitMs: problem.timeLimitMs,
    });
    return { ok: true, report: buildReport(mode, tests, results) };
  } catch (error) {
    if (error instanceof JudgeError) {
      console.error("[judge]", error.message);
      return { ok: false, message: ERROR_MESSAGES[error.code] };
    }
    throw error;
  }
}

/** Runs the code against the problem's sample tests. */
export async function runCode(input: {
  slug: string;
  language: LanguageId;
  code: string;
}): Promise<JudgeResponse> {
  return judgeSolution("run", input);
}

/**
 * Checks the code against every test, hidden ones included.
 * The verdict is not stored yet: a Submission row needs a user, which arrives
 * with authentication.
 */
export async function submitCode(input: {
  slug: string;
  language: LanguageId;
  code: string;
}): Promise<JudgeResponse> {
  return judgeSolution("submit", input);
}
