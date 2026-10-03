import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeWorkspaceLoader } from "@/components/code-workspace-loader";
import { DifficultyLabel } from "@/components/difficulty";
import { Statement } from "@/components/statement";
import { getProblemBySlug } from "@/lib/problems";

export async function generateMetadata({
  params,
}: PageProps<"/problems/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const problem = await getProblemBySlug(slug);
  if (!problem) return { title: "Masala topilmadi" };

  return {
    title: problem.title,
    description: `"${problem.title}" masalasi: shart, namuna testlar va kod muharriri.`,
  };
}

function formatTimeLimit(ms: number) {
  return `${Number((ms / 1000).toFixed(2))} s`;
}

function TestData({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-4 py-3">
      <p className="font-mono text-xs tracking-wider text-muted uppercase">
        {label}
      </p>
      <pre className="mt-1.5 overflow-x-auto font-mono text-sm leading-relaxed">
        {value}
      </pre>
    </div>
  );
}

export default async function ProblemPage({
  params,
}: PageProps<"/problems/[slug]">) {
  const { slug } = await params;
  const problem = await getProblemBySlug(slug);
  if (!problem) notFound();

  return (
    // On large screens the two panes fill the viewport below the header and
    // scroll independently; on small screens they stack and the page scrolls.
    <main className="grid flex-1 lg:h-[calc(100dvh-var(--header-h))] lg:flex-none lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:grid-rows-[minmax(0,1fr)]">
      <article className="scroll-pane px-4 py-6 sm:px-6 lg:overflow-y-auto lg:py-8">
        <Link
          href="/problems"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Barcha masalalar
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-balance">
          <span className="font-mono font-normal text-muted">
            {problem.orderIndex + 1}.
          </span>{" "}
          {problem.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          <DifficultyLabel difficulty={problem.difficulty} />
          <span>Vaqt chegarasi: {formatTimeLimit(problem.timeLimitMs)}</span>
          {problem.tags.length > 0 && (
            <span className="flex flex-wrap gap-1.5">
              {problem.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line px-2 py-0.5 text-xs"
                >
                  {tag}
                </span>
              ))}
            </span>
          )}
        </div>

        <div className="mt-6">
          <Statement markdown={problem.description} />
        </div>

        {problem.testCases.length > 0 && (
          <section className="mt-8">
            <h2 className="font-mono text-xs font-medium tracking-wider text-muted uppercase">
              Namuna testlar
            </h2>
            <ol className="mt-3 space-y-3">
              {problem.testCases.map((test, index) => (
                <li
                  key={test.id}
                  aria-label={`${index + 1}-test`}
                  className="grid divide-y divide-line rounded-lg border border-line bg-surface sm:grid-cols-2 sm:divide-x sm:divide-y-0"
                >
                  <TestData label="Kirish" value={test.input} />
                  <TestData label="Kutilgan chiqish" value={test.expectedOutput} />
                </li>
              ))}
            </ol>
          </section>
        )}
      </article>

      <section
        aria-label="Kod muharriri"
        className="flex h-[75dvh] min-h-96 flex-col border-t border-line lg:h-auto lg:min-h-0 lg:border-t-0 lg:border-l"
      >
        <CodeWorkspaceLoader
          key={problem.slug}
          slug={problem.slug}
          starterCode={problem.starterCode}
        />
      </section>
    </main>
  );
}
