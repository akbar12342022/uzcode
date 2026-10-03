import "server-only";

import { cache } from "react";
import { z } from "zod";
import { LANGUAGES, type StarterCode } from "@/lib/languages";
import { prisma } from "@/lib/prisma";

const starterCodeSchema = z.record(z.string(), z.string());

// Problem.starterCode is free-form JSON in the database; keep only the
// languages we support and drop anything malformed.
function parseStarterCode(value: unknown): StarterCode {
  const parsed = starterCodeSchema.safeParse(value);
  if (!parsed.success) return {};

  const starterCode: StarterCode = {};
  for (const { id } of LANGUAGES) {
    if (id in parsed.data) starterCode[id] = parsed.data[id];
  }
  return starterCode;
}

export async function getProblemList() {
  return prisma.problem.findMany({
    orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      difficulty: true,
      tags: true,
      orderIndex: true,
      timeLimitMs: true,
      // Shown in the list so a problem's size is visible before opening it.
      _count: { select: { testCases: true } },
    },
  });
}

export type ProblemListItem = Awaited<ReturnType<typeof getProblemList>>[number];

// Wrapped in React `cache` so generateMetadata and the page share one query
// per request.
export const getProblemBySlug = cache(async (slug: string) => {
  const problem = await prisma.problem.findUnique({
    where: { slug },
    select: {
      slug: true,
      title: true,
      description: true,
      difficulty: true,
      tags: true,
      starterCode: true,
      timeLimitMs: true,
      orderIndex: true,
      // Only sample tests ever leave the server; hidden tests stay private.
      testCases: {
        where: { isSample: true },
        orderBy: { orderIndex: "asc" },
        select: { id: true, input: true, expectedOutput: true },
      },
    },
  });
  if (!problem) return null;

  return { ...problem, starterCode: parseStarterCode(problem.starterCode) };
});

export type ProblemDetail = NonNullable<
  Awaited<ReturnType<typeof getProblemBySlug>>
>;

/**
 * Everything the judge needs to check a solution. Includes the hidden tests,
 * so the result must never be passed to the client as-is.
 */
export async function getProblemForJudging(slug: string) {
  return prisma.problem.findUnique({
    where: { slug },
    select: {
      id: true,
      timeLimitMs: true,
      testCases: {
        orderBy: { orderIndex: "asc" },
        select: { input: true, expectedOutput: true, isSample: true },
      },
    },
  });
}
