import Link from "next/link";
import { connection } from "next/server";
import { DifficultyLabel } from "@/components/difficulty";
import { HomeDemo } from "@/components/home-demo";
import { LANGUAGES } from "@/lib/languages";
import { getProblemList, type ProblemListItem } from "@/lib/problems";

// The home page is the index, not a brochure. If the database is unreachable
// the note and the demo still work, so the list fails quietly.
async function loadProblems(): Promise<ProblemListItem[]> {
  try {
    return await getProblemList();
  } catch {
    return [];
  }
}

function countTags(problems: ProblemListItem[]) {
  const counts = new Map<string, number>();
  for (const problem of problems) {
    for (const tag of problem.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

const ROW =
  "grid grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1.5 px-3 sm:grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,13rem)_4.5rem_6.5rem] sm:items-center sm:gap-y-0";

export default async function Home() {
  await connection();
  const problems = await loadProblems();
  const tags = countTags(problems);
  const testCount = problems.reduce(
    (total, problem) => total + problem._count.testCases,
    0,
  );

  return (
    <main className="flex-1">
      <section className="dot-grid border-b border-line">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:py-20">
          <div className="lg:col-span-5">
            <h1 className="font-mono text-[2.1rem] leading-[1.1] font-semibold tracking-tight sm:text-[2.75rem]">
              {"Algoritm masalalari, o'zbekcha"}
            </h1>
            <p className="mt-6 max-w-prose leading-relaxed text-ink-dim">
              {
                "Ishga suhbatda so'raladigan savollar yig'ilgan. Shartlar o'zbek tilida yozilgan, inglizchadan tarjima qilingan emas. Yechimingizni tizim yashirin testlarda tekshirib, qaysi test yiqilganini ko'rsatadi."
              }
            </p>

            {problems.length > 0 && (
              <dl className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-5 font-mono text-sm">
                <div className="flex items-baseline gap-2">
                  <dt className="text-ink">{problems.length}</dt>
                  <dd className="text-muted">masala</dd>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="text-ink">{LANGUAGES.length}</dt>
                  <dd className="text-muted">til</dd>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="text-ink">{testCount}</dt>
                  <dd className="text-muted">test</dd>
                </div>
              </dl>
            )}

            <Link
              href="/problems"
              className="mt-8 inline-flex rounded-md bg-accent px-5 py-2.5 font-medium text-on-accent transition-colors hover:bg-accent-hover"
            >
              Masalalarni ko&apos;rish
            </Link>
          </div>

          <div className="lg:col-span-7">
            <p className="mb-3 text-sm text-muted">
              {"Ro'yxatdan o'tmasdan, shu yerning o'zida yechib ko'ring:"}
            </p>
            <HomeDemo />
          </div>
        </div>
      </section>

      {tags.length > 0 && (
        <section className="border-b border-line bg-surface">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-5 gap-y-2.5 px-4 py-4 sm:px-6">
            <h2 className="font-mono text-xs text-muted">Mavzular</h2>
            {tags.map(([tag, count]) => (
              <span key={tag} className="text-sm text-ink-dim">
                {tag}
                <span className="ml-1.5 font-mono text-xs text-muted tabular-nums">
                  {count}
                </span>
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="font-mono text-lg font-semibold tracking-tight">
          Masalalar
        </h2>

        {problems.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            {"Masalalar ro'yxatini hozir ochib bo'lmadi."}
          </p>
        ) : (
          <div className="mt-5 overflow-hidden rounded-lg border border-line">
            <div
              aria-hidden
              className={`${ROW} hidden border-b border-line bg-surface py-2.5 font-mono text-xs text-muted sm:grid`}
            >
              <span>#</span>
              <span>Masala</span>
              <span>Mavzu</span>
              <span className="text-right">Test</span>
              <span className="justify-self-end">Qiyinlik</span>
            </div>
            <ul className="divide-y divide-line">
              {problems.map((problem, index) => (
                <li key={problem.id}>
                  <Link
                    href={`/problems/${problem.slug}`}
                    className={`${ROW} group py-3.5 transition-colors hover:bg-surface`}
                  >
                    <span className="col-start-1 row-start-1 font-mono text-sm text-muted tabular-nums">
                      {index + 1}
                    </span>
                    <span className="col-start-2 row-start-1 font-medium transition-colors group-hover:text-accent">
                      {problem.title}
                    </span>
                    <span className="col-start-2 row-start-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted sm:col-start-3 sm:row-start-1 sm:text-sm">
                      {problem.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </span>
                    <span className="hidden text-right font-mono text-sm text-muted tabular-nums sm:col-start-4 sm:row-start-1 sm:block">
                      {problem._count.testCases}
                    </span>
                    <DifficultyLabel
                      difficulty={problem.difficulty}
                      className="col-start-3 row-start-1 justify-self-end sm:col-start-5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <h2 className="font-mono text-lg font-semibold tracking-tight">
              {"Har bir masalaga yechim tahlili"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {
                "Yechim topilgandan keyin ham o'qishga arziydi: suhbatda kodning o'zi emas, nega shunday yozilgani so'raladi."
              }
            </p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <p className="max-w-prose leading-relaxed text-ink-dim">
              {
                "Yuqoridagi masalani ikki xil yechsa bo'ladi. Birinchisi — har bir sonni qolgan hammasi bilan juftlab tekshirish. Ishlaydi, lekin ro'yxatda 10 000 ta son bo'lsa, qariyb 50 million solishtiruv kerak bo'ladi."
              }
            </p>
            <p className="mt-4 max-w-prose leading-relaxed text-ink-dim">
              {
                "Ikkinchisi — ro'yxat bo'ylab bir marta yurib, har bir son uchun yetishmayotgan juftini lug'atdan qidirish. Javob har qadamda darhol topiladi."
              }
            </p>
            <dl className="mt-6 grid max-w-md grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-2 border-t border-line pt-4 text-sm">
              <dt className="text-ink-dim">Juftlab tekshirish</dt>
              <dd className="font-mono text-muted">O(n²)</dd>
              <dt className="text-ink-dim">Lug&apos;at bilan bir marta yurish</dt>
              <dd className="font-mono text-muted">O(n)</dd>
            </dl>
            <p className="mt-6 max-w-prose text-sm leading-relaxed text-muted">
              {
                "Suhbatda aynan shu farqni so'rashadi. Shuning uchun har bir masala ortida nega bunday yechilgani ham tushuntiriladi."
              }
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 text-sm text-muted sm:px-6">
          {"Xato topsangiz yoki masala taklif qilmoqchi bo'lsangiz, yozing: "}
          <a
            href="https://t.me/s_abdurahmon_717"
            className="text-ink-dim underline underline-offset-4 hover:text-accent"
          >
            @s_abdurahmon_717
          </a>
        </div>
      </footer>
    </main>
  );
}
