export default function ProblemsLoading() {
  return (
    <main
      aria-busy
      className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6"
    >
      <h1 className="font-mono text-3xl font-semibold tracking-tight">
        Masalalar
      </h1>
      <div className="mt-6 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface motion-safe:animate-pulse">
        {Array.from({ length: 6 }, (_, row) => (
          <div key={row} className="px-5 py-4">
            <div className="h-5 w-1/2 rounded bg-raised" />
          </div>
        ))}
      </div>
    </main>
  );
}
