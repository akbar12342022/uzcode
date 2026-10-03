import Link from "next/link";
import { Ikat } from "@/components/ikat";

// Total height (ikat band + bar + border) must match --header-h in globals.css.
export function SiteHeader() {
  return (
    <header className="border-b border-line bg-surface">
      <Ikat cell={2} rows={[2, 6]} className="h-2" />
      <div className="flex h-14 items-center gap-8 px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-ink"
        >
          UzCode
        </Link>
        <nav aria-label="Asosiy">
          <Link
            href="/problems"
            className="text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            Masalalar
          </Link>
        </nav>
      </div>
    </header>
  );
}
