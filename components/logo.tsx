/**
 * The mark is the product's smallest unit of meaning: a grid of test cells,
 * three passed and one still waiting. The same cell shape appears in the
 * editor's result strip and in a solver's history.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <svg
        viewBox="0 0 16 16"
        aria-hidden
        className="size-4 shrink-0"
        fill="none"
      >
        <rect x="0" y="0" width="7" height="7" rx="1.5" fill="currentColor" />
        <rect x="9" y="0" width="7" height="7" rx="1.5" fill="currentColor" />
        <rect x="0" y="9" width="7" height="7" rx="1.5" fill="currentColor" />
        <rect
          x="0.75"
          y="9.75"
          width="14.5"
          height="5.5"
          rx="1"
          fill="none"
          stroke="none"
        />
        <rect
          x="9.5"
          y="9.5"
          width="6"
          height="6"
          rx="1.25"
          stroke="currentColor"
          strokeOpacity="0.4"
        />
      </svg>
      <span className="font-mono text-[0.9375rem] font-semibold tracking-tight">
        UzCode
      </span>
    </span>
  );
}
