"use client";
import { useEffect, useRef } from "react";
import { useEssayStore } from "@/stores/essay-store";

export function useAutoSave(debounceMs = 2000) {
  const { essayId, body, markSaved } = useEssayStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!essayId || !body) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/essays/${essayId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        });
        markSaved();
      } catch (e) {
        console.error("Auto-save failed:", e);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [body, essayId, debounceMs, markSaved]);
}
