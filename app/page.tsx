import Link from "next/link";
import { connection } from "next/server";
import { DifficultyLabel } from "@/components/difficulty";
import { HomeDemo } from "@/components/home-demo";
import { getProblemList, type ProblemListItem } from "@/lib/problems";

// The home page is the index, not a brochure: a short note, one problem you
// can solve before signing up, then the actual list. If the database is
// unreachable the note and the demo still work, so the list fails quietly.
async function loadProblems(): Promise<ProblemListItem[]> {
  try {
    return await getProblemList();
  } catch {
    return [];
  }
}

export default async function Home() {
  await connection();
  const problems = await loadProblems();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-12 pb-20 sm:px-6">
      <h1 className="font-mono text-[1.75rem] leading-tight font-semibold tracking-tight sm:text-[2.1rem]">
        {"Algoritm masalalari, o'zbekcha"}
      </h1>

      <div className="mt-5 space-y-3 text-[0.9375rem] leading-relaxed text-ink-dim">
        <p>
          {
            "Ishga suhbatda so'raladigan savollar yig'ilgan. Shartlar o'zbek tilida yozilgan, inglizchadan tarjima qilingan emas."
          }
        </p>
        <p>
          {
            "Yechimni Python, JavaScript yoki C++ da yozasiz. Tizim uni yashirin testlarda tekshirib, qaysi test yiqilganini ko'rsatadi."
          }
        </p>
      </div>

      <hr className="my-10 border-line" />

      <h2 className="font-mono text-base font-semibold">
        {"Birinchi masala — shu yerning o'zida"}
      </h2>
      <p className="mt-2 mb-5 text-sm text-muted">
        {"Ro'yxatdan o'tish shart emas. Kodni yozing va ishga tushiring."}
      </p>
      <HomeDemo />

      <hr className="my-10 border-line" />

      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-mono text-base font-semibold">Masalalar</h2>
        <p className="font-mono text-sm text-muted">
          {problems.length > 0 ? `${problems.length} ta` : null}
        </p>
      </div>

      {problems.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          {"Masalalar ro'yxatini hozir ochib bo'lmadi."}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {problems.map((problem, index) => (
            <li key={problem.id}>
              <Link
                href={`/problems/${problem.slug}`}
                className="group flex items-baseline gap-4 py-3 transition-colors hover:text-accent"
              >
                <span className="w-5 shrink-0 font-mono text-sm text-muted tabular-nums">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 font-medium">
                  {problem.title}
                </span>
                <DifficultyLabel
                  difficulty={problem.difficulty}
                  className="shrink-0"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-12 text-sm leading-relaxed text-muted">
        {"Xato topsangiz yoki masala taklif qilmoqchi bo'lsangiz, yozing: "}
        <a
          href="https://t.me/s_abdurahmon_717"
          className="text-ink-dim underline underline-offset-4 hover:text-accent"
        >
          @s_abdurahmon_717
        </a>
      </p>
    </main>
  );
}
