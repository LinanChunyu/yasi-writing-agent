"use client";
import { useEffect } from "react";
import { useEssayStore } from "@/stores/essay-store";
import { cn } from "@/lib/utils";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

interface TimerProps {
  limit?: number; // seconds, default 40 min
  className?: string;
}

export function Timer({ limit = 40 * 60, className }: TimerProps) {
  const { timerSeconds, timerRunning, tickTimer } = useEssayStore();

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, tickTimer]);

  const isWarning = timerSeconds > limit * 0.85;
  const isOver = timerSeconds > limit;

  return (
    <span
      className={cn(
        "text-sm font-mono tabular-nums",
        isWarning && !isOver && "text-amber-500",
        isOver && "text-rose-500 animate-pulse",
        className
      )}
    >
      {formatTime(timerSeconds)}
      {limit && ` / ${formatTime(limit)}`}
    </span>
  );
}
