import Link from "next/link";
import { Logo } from "@/components/logo";

// Height (bar + border) must match --header-h in globals.css.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-7 px-4 sm:px-6">
        <Link href="/" className="text-ink hover:text-accent">
          <Logo />
        </Link>
        <nav aria-label="Asosiy" className="flex items-center gap-5 text-sm">
          <Link
            href="/problems"
            className="font-medium text-muted transition-colors hover:text-ink"
          >
            Masalalar
          </Link>
        </nav>
      </div>
    </header>
  );
}
