import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sahifa topilmadi",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center px-4 py-16 sm:px-6">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
        Sahifa topilmadi
      </h1>
      <p className="mt-3 text-muted">
        {"Bu manzilda sahifa yo'q. Havola eskirgan yoki noto'g'ri yozilgan bo'lishi mumkin."}
      </p>
      <Link
        href="/problems"
        className="mt-6 font-medium text-primary underline underline-offset-4"
      >
        Barcha masalalar
      </Link>
    </main>
  );
}
