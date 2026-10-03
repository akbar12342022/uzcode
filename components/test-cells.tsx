import { cn } from "@/lib/utils";

export type CellState = "ok" | "fail";

/**
 * The product's signature device: one cell per test, filled as the judge
 * works through them. It appears in the home demo, on a problem page and —
 * later — as a solver's history. Decorative on its own, so the count that
 * matters is always written next to it in words.
 */
export function TestCells({
  total,
  results,
  className,
}: {
  total: number;
  results?: readonly CellState[] | null;
  className?: string;
}) {
  return (
    <span aria-hidden className={cn("flex items-center gap-[3px]", className)}>
      {Array.from({ length: total }, (_, index) => {
        const state = results?.[index];
        return (
          <span
            key={index}
            className={cn(
              "size-3.5 rounded-[2px] border transition-colors",
              !state && "border-line-strong",
              state === "ok" && "border-ok bg-ok/80",
              state === "fail" && "border-fail bg-fail/80",
            )}
          />
        );
      })}
    </span>
  );
}
