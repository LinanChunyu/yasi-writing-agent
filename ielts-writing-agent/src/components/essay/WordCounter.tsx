"use client";
import { cn } from "@/lib/utils";

interface WordCounterProps {
  count: number;
  min?: number;
  target?: number;
  className?: string;
}

export function WordCounter({ count, min = 250, target = 280, className }: WordCounterProps) {
  const isUnder = count < min;
  const isGood = count >= min && count <= target + 20;
  const isOver = count > target + 20;

  return (
    <span
      className={cn(
        "text-sm font-mono tabular-nums",
        isUnder && "text-amber-500",
        isGood && "text-emerald-600",
        isOver && "text-rose-500",
        className
      )}
    >
      {count} words
    </span>
  );
}
