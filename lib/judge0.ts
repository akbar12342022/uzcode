import "server-only";

import {
  JudgeError,
  type JudgeRequest,
  type JudgeResult,
} from "@/lib/judge-core";
import type { Verdict } from "@/lib/judge-types";
import { LANGUAGES } from "@/lib/languages";

// Judge0 status ids: https://ce.judge0.com/#statuses-and-languages-status
const IN_QUEUE = 1;
const PROCESSING = 2;

function toVerdict(statusId: number): Verdict {
  if (statusId === 3) return "ACCEPTED";
  if (statusId === 4) return "WRONG_ANSWER";
  if (statusId === 5) return "TIME_LIMIT_EXCEEDED";
  if (statusId === 6) return "COMPILE_ERROR";
  if (statusId >= 7 && statusId <= 12) return "RUNTIME_ERROR";
  return "INTERNAL_ERROR";
}

// Wait before each poll. One batch needs a create call plus as many polls as
// it takes, and hosted plans count every call, so start slow enough that the
// first or second poll usually finds the run finished. About 30 s in total.
const POLL_DELAYS_MS = [1500, 1500, 2000, 3000, 4000, 5000, 6000, 7000];
const REQUEST_TIMEOUT_MS = 15_000;

function getConfig() {
  const baseUrl = process.env.JUDGE0_URL?.trim().replace(/\/+$/, "");
  if (!baseUrl) throw new JudgeError("NOT_CONFIGURED", "JUDGE0_URL is empty");

  let host: string;
  try {
    host = new URL(baseUrl).host;
  } catch {
    throw new JudgeError("NOT_CONFIGURED", "JUDGE0_URL is not a valid URL");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // RapidAPI-hosted Judge0 authenticates with a key and the API host name.
  const rapidApiKey = process.env.JUDGE0_RAPIDAPI_KEY?.trim();
  if (rapidApiKey) {
    headers["X-RapidAPI-Key"] = rapidApiKey;
    headers["X-RapidAPI-Host"] = host;
  } else if (host.endsWith("rapidapi.com")) {
    throw new JudgeError("NOT_CONFIGURED", "JUDGE0_RAPIDAPI_KEY is empty");
  }

  // Self-hosted Judge0 can be protected with its own token.
  const authToken = process.env.JUDGE0_AUTH_TOKEN?.trim();
  if (authToken) headers["X-Auth-Token"] = authToken;

  return { baseUrl, headers };
}

async function request(url: string, init: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new JudgeError("UNAVAILABLE", String(error));
  }

  if (response.status === 401 || response.status === 403) {
    throw new JudgeError("UNAUTHORIZED", `HTTP ${response.status}`);
  }
  if (response.status === 429) throw new JudgeError("RATE_LIMITED");
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new JudgeError(
      "UNAVAILABLE",
      `HTTP ${response.status} ${body.slice(0, 300)}`,
    );
  }

  try {
    return await response.json();
  } catch {
    throw new JudgeError("UNAVAILABLE", "response was not JSON");
  }
}

// Everything travels base64-encoded so arbitrary program output survives.
const encode = (text: string) => Buffer.from(text, "utf8").toString("base64");
const decode = (value: unknown) =>
  typeof value === "string" ? Buffer.from(value, "base64").toString("utf8") : "";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type RawSubmission = {
  token?: string;
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  status?: { id?: number } | null;
  time?: string | number | null;
  memory?: number | null;
};

function toResult(raw: RawSubmission): JudgeResult {
  const seconds = raw.time == null ? NaN : Number(raw.time);
  return {
    verdict: toVerdict(raw.status?.id ?? 0),
    stdout: decode(raw.stdout),
    stderr: decode(raw.stderr) || decode(raw.message),
    compileOutput: decode(raw.compile_output),
    timeMs: Number.isFinite(seconds) ? Math.round(seconds * 1000) : null,
    memoryKb: typeof raw.memory === "number" ? raw.memory : null,
  };
}

/**
 * Runs `sourceCode` once per test on Judge0 and resolves with one result per
 * test, in the same order. Judge0 itself compares stdout with the expected
 * output (ignoring trailing whitespace). Throws `JudgeError` when the judge
 * is not configured, refuses the request, or does not finish in time.
 */
export async function judgeWithJudge0(
  options: JudgeRequest,
): Promise<JudgeResult[]> {
  const { baseUrl, headers } = getConfig();
  const judge0LanguageId = LANGUAGES.find(
    ({ id }) => id === options.language,
  )!.judge0Id;
  const cpuSeconds = options.timeLimitMs / 1000;

  const created = await request(
    `${baseUrl}/submissions/batch?base64_encoded=true`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        submissions: options.tests.map((test) => ({
          language_id: judge0LanguageId,
          source_code: encode(options.sourceCode),
          // Programs commonly expect the last input line to end with a newline.
          stdin: encode(test.stdin.endsWith("\n") ? test.stdin : `${test.stdin}\n`),
          expected_output: encode(test.expectedOutput),
          cpu_time_limit: cpuSeconds,
          wall_time_limit: cpuSeconds + 2,
        })),
      }),
    },
  );

  const tokens = Array.isArray(created)
    ? created.map((item: RawSubmission) => item?.token)
    : [];
  if (
    tokens.length !== options.tests.length ||
    tokens.some((token) => typeof token !== "string")
  ) {
    throw new JudgeError(
      "UNAVAILABLE",
      `batch was not accepted: ${JSON.stringify(created).slice(0, 300)}`,
    );
  }

  const query = new URLSearchParams({
    tokens: tokens.join(","),
    base64_encoded: "true",
    fields: "token,stdout,stderr,compile_output,message,status,time,memory",
  });

  for (const delay of POLL_DELAYS_MS) {
    await sleep(delay);

    const polled = (await request(`${baseUrl}/submissions/batch?${query}`, {
      method: "GET",
      headers,
    })) as { submissions?: (RawSubmission | null)[] };

    const submissions = polled.submissions ?? [];
    const finished =
      submissions.length === tokens.length &&
      submissions.every((submission) => {
        const statusId = submission?.status?.id;
        return (
          typeof statusId === "number" &&
          statusId !== IN_QUEUE &&
          statusId !== PROCESSING
        );
      });

    if (finished) {
      // Judge0 answers in token order; match by token anyway to be safe.
      return tokens.map((token) =>
        toResult(submissions.find((s) => s?.token === token) ?? {}),
      );
    }
  }

  throw new JudgeError("TIMEOUT");
}
