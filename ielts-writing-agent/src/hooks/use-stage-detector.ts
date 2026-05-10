"use client";
import { useMemo } from "react";
import { detectStage } from "@/lib/stage-detector";
import type { WritingStage } from "@/lib/agents/prompts/coach-stage-overlays";

export function useStageDetector(body: string, hasQuestion: boolean): WritingStage {
  return useMemo(() => detectStage(body, { hasQuestion }), [body, hasQuestion]);
}
