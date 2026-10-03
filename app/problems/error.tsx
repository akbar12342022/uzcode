"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

export default function ProblemsError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {"Masalalarni yuklab bo'lmadi"}
      </h1>
      <p className="mt-3 text-muted">
        {"Server ma'lumotlar bazasidan javob ololmadi. Birozdan so'ng qayta urinib ko'ring."}
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 rounded-lg bg-primary px-4 py-2.5 font-medium text-on-primary transition-opacity hover:opacity-90"
      >
        Qayta urinish
      </button>
    </main>
  );
}
