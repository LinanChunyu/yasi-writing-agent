"use client";
import { useEffect, useRef } from "react";
import { useEssayStore } from "@/stores/essay-store";

interface UseEssayInitOptions {
  questionId: string;
  mode: "real" | "assist";
}

export function useEssayInit({ questionId, mode }: UseEssayInitOptions) {
  const { essayId, questionId: storedQuestionId, mode: storedMode, setEssayId, setQuestion, reset } =
    useEssayStore();
  const initRef = useRef(false);

  useEffect(() => {
    // Reuse existing essay only if same question + mode
    if (
      essayId &&
      storedQuestionId === questionId &&
      storedMode === mode &&
      !initRef.current
    ) {
      initRef.current = true;
      return;
    }

    // New question or mode — reset and create new essay
    if (initRef.current) return;
    initRef.current = true;

    reset();

    async function createEssay() {
      try {
        const essayRes = await fetch("/api/essays", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId, mode }),
        });
        if (!essayRes.ok) throw new Error("Failed to create essay");
        const { id } = await essayRes.json();
        setEssayId(id);

        // Fetch question for the prompt
        const qRes = await fetch(`/api/questions/${questionId}`);
        if (qRes.ok) {
          const q = await qRes.json();
          setQuestion(questionId, q.prompt ?? "");
        }
      } catch (e) {
        console.error("[useEssayInit] error:", e);
      }
    }

    createEssay();
    // Only run on mount / when questionId+mode changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId, mode]);
}
