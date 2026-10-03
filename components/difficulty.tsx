import type { Difficulty } from "@/lib/generated/prisma/enums";
import { cn } from "@/lib/utils";

const DIFFICULTY: Record<Difficulty, { label: string; tone: string }> = {
  EASY: { label: "Oson", tone: "text-easy" },
  MEDIUM: { label: "O'rta", tone: "text-medium" },
  HARD: { label: "Qiyin", tone: "text-hard" },
};

export function DifficultyLabel({
  difficulty,
  className,
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  const { label, tone } = DIFFICULTY[difficulty];

  return (
    <span className={cn("text-sm font-medium", tone, className)}>{label}</span>
  );
}
