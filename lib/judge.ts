import "server-only";

import { judgeWithDocker } from "@/lib/judge-docker";
import type { JudgeRequest, JudgeResult } from "@/lib/judge-core";
import { judgeWithJudge0 } from "@/lib/judge0";

/**
 * Picks the engine that checks a solution.
 *
 * `docker` (the default) runs the code in a container on this machine:
 * no key, no quota, and the same three languages. `judge0` calls a hosted
 * Judge0 instance, which is what a deployed site will use.
 */
export type JudgeEngine = "docker" | "judge0";

export function getJudgeEngine(): JudgeEngine {
  return process.env.JUDGE_ENGINE?.trim() === "judge0" ? "judge0" : "docker";
}

export function judge(request: JudgeRequest): Promise<JudgeResult[]> {
  return getJudgeEngine() === "judge0"
    ? judgeWithJudge0(request)
    : judgeWithDocker(request);
}
