import type { WritingStage } from "./agents/prompts/coach-stage-overlays";

export interface StageContext {
  hasQuestion: boolean;
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function hasConclusionInTail(text: string): boolean {
  const words = text.trim().split(/\s+/);
  const tailWords = words.slice(-Math.ceil(words.length * 0.3)).join(" ").toLowerCase();
  return /\b(in conclusion|to conclude|in summary|to summarise|overall|in short)\b/.test(tailWords);
}

function hasOutlineMarkers(text: string): boolean {
  return /\b(firstly|secondly|thirdly|first point|main point|body paragraph|outline)\b/i.test(text);
}

export function detectStage(body: string, ctx: StageContext): WritingStage {
  const wc = wordCount(body);
  const trimmed = body.trim();

  if (!ctx.hasQuestion) return "blank";
  if (wc === 0) return "blank";
  if (wc < 30) return "stance_undecided";
  if (wc < 80 || hasOutlineMarkers(trimmed)) return "outline_drafting";
  if (wc < 150) return "intro_writing";
  if (wc < 220) return "body_writing";
  if (hasConclusionInTail(trimmed)) return "completed";
  return "near_completion";
}
