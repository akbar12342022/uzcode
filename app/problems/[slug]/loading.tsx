export default function ProblemLoading() {
  return (
    <main
      aria-busy
      className="grid flex-1 lg:h-[calc(100dvh-var(--header-h))] lg:flex-none lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
    >
      <div className="space-y-4 px-4 py-6 motion-safe:animate-pulse sm:px-6 lg:py-8">
        <div className="h-4 w-32 rounded bg-sunken" />
        <div className="h-8 w-2/3 rounded bg-sunken" />
        <div className="h-4 w-1/2 rounded bg-sunken" />
        <div className="h-32 rounded-lg bg-sunken" />
      </div>
      <div className="min-h-96 border-t border-line bg-surface lg:border-t-0 lg:border-l" />
    </main>
  );
}
