import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { DifficultyLabel } from "@/components/difficulty";
import { getProblemList } from "@/lib/problems";

export const metadata: Metadata = {
  title: "Masalalar",
  description:
    "Algoritm va dasturlash masalalari ro'yxati: osonidan qiyinigacha.",
};

// Number, title, tags, difficulty. Shared by the header row and every item.
const COLUMNS =
  "sm:grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,15rem)_4.5rem] sm:items-center sm:gap-4";

export default async function ProblemsPage() {
  // The list comes straight from the database, so render it per request
  // instead of freezing it into the build.
  await connection();
  const problems = await getProblemList();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Masalalar
        </h1>
        <p className="font-mono text-sm text-muted">
          {problems.length} ta masala
        </p>
      </div>

      {problems.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-line px-5 py-10 text-center text-muted">
          {"Hozircha masala yo'q. Namuna masalalarni yuklash uchun "}
          <code className="font-mono text-sm text-ink">npm run db:seed</code>
          {" buyrug'ini ishga tushiring."}
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-line bg-surface">
          <div
            aria-hidden
            className={`hidden border-b border-line px-5 py-2.5 font-mono text-xs tracking-wider text-muted uppercase sm:grid ${COLUMNS}`}
          >
            <span className="text-right">#</span>
            <span>Masala</span>
            <span>Teglar</span>
            <span className="text-right">Qiyinlik</span>
          </div>
          <ul className="divide-y divide-line">
            {problems.map((problem) => (
              <li key={problem.id}>
                {/* Small screens: title and difficulty on one line, tags below. */}
                <Link
                  href={`/problems/${problem.slug}`}
                  className={`group grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-2 px-5 py-3.5 transition-colors hover:bg-sunken focus-visible:-outline-offset-2 ${COLUMNS}`}
                >
                  <span className="hidden text-right font-mono text-sm text-muted tabular-nums sm:block">
                    {problem.orderIndex + 1}
                  </span>
                  <span className="font-medium group-hover:text-primary">
                    <span className="font-mono text-sm font-normal text-muted sm:hidden">
                      {problem.orderIndex + 1}.{" "}
                    </span>
                    {problem.title}
                  </span>
                  <span className="col-span-2 row-start-2 flex flex-wrap gap-1.5 sm:col-auto sm:row-auto">
                    {problem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-line px-2 py-0.5 text-xs text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </span>
                  <DifficultyLabel
                    difficulty={problem.difficulty}
                    className="col-start-2 row-start-1 text-right sm:col-auto sm:row-auto"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
