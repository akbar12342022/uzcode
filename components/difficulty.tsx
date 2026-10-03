import type { Difficulty } from "@/lib/generated/prisma/enums";
import { cn } from "@/lib/utils";

/**
 * Difficulty is shown as a three-step meter plus the word, never as a coloured
 * word: in this product green, red and amber mean a verdict, and a difficulty
 * painted in the same palette would compete with the test results for the
 * same glance. The meter is scannable, the word carries the meaning.
 */
const DIFFICULTY: Record<Difficulty, { label: string; steps: number }> = {
  EASY: { label: "Oson", steps: 1 },
  MEDIUM: { label: "O'rta", steps: 2 },
  HARD: { label: "Qiyin", steps: 3 },
};

export function DifficultyLabel({
  difficulty,
  className,
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  const { label, steps } = DIFFICULTY[difficulty];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span aria-hidden className="flex items-end gap-[2px]">
        {[1, 2, 3].map((step) => (
          <span
            key={step}
            className={cn(
              "w-[3px] rounded-[1px]",
              step === 1 && "h-2",
              step === 2 && "h-3",
              step === 3 && "h-4",
              step <= steps ? "bg-ink-dim" : "bg-line-strong",
            )}
          />
        ))}
      </span>
      <span className="text-sm text-muted">{label}</span>
    </span>
  );
}
