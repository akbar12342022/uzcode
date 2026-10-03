import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Ikat } from "@/components/ikat";

export default function Home() {
  return (
    <main className="mx-auto grid w-full max-w-5xl flex-1 content-center items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-14">
      <div>
        <h1 className="font-display text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl">
          {"Algoritmlarni o'zbek tilida mashq qiling"}
        </h1>
        <p className="mt-5 max-w-prose text-lg leading-relaxed text-muted">
          {
            "Masala sharti ham, izohlar ham o'zbekcha. Yechimni Python, JavaScript yoki C++ da brauzerning o'zida yozing."
          }
        </p>
        <Link
          href="/problems"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-on-primary transition-opacity hover:opacity-90"
        >
          {"Masalalarga o'tish"}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>

      <Ikat cell={10} className="h-40 rounded-2xl sm:h-60 lg:h-80" />
    </main>
  );
}
