import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { DifficultyLabel } from "@/components/difficulty";
import { getProblemList } from "@/lib/problems";

export const metadata: Metadata = {
  title: "Masalalar",
  description:
    "Ishga suhbatda so'raladigan algoritm masalalari — osonidan qiyiniga qarab.",
};

export default async function ProblemsPage() {
  // The list comes straight from the database, so render it per request
  // instead of freezing it into the build.
  await connection();
  const problems = await getProblemList();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-mono text-2xl font-semibold tracking-tight">
          Masalalar
        </h1>
        {problems.length > 0 && (
          <p className="font-mono text-sm text-muted">{problems.length} ta</p>
        )}
      </div>

      {problems.length === 0 ? (
        <p className="mt-8 text-[0.9375rem] leading-relaxed text-muted">
          {"Hozircha masala yo'q. Namunalarni yuklash uchun "}
          <code className="font-mono text-sm text-ink">npm run db:seed</code>
          {" buyrug'ini ishga tushiring."}
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {problems.map((problem, index) => (
            <li key={problem.id}>
              <Link
                href={`/problems/${problem.slug}`}
                className="group grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1.5 py-3.5"
              >
                <span className="col-start-1 row-start-1 font-mono text-sm text-muted tabular-nums">
                  {index + 1}
                </span>
                <span className="col-start-2 row-start-1 font-medium transition-colors group-hover:text-accent">
                  {problem.title}
                </span>
                <DifficultyLabel
                  difficulty={problem.difficulty}
                  className="col-start-3 row-start-1 self-center"
                />
                {problem.tags.length > 0 && (
                  <span className="col-start-2 row-start-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                    {problem.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
