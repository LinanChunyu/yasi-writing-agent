"use client";
import { Badge } from "@/components/ui/badge";
import type { WritingStage } from "@/lib/agents/prompts/coach-stage-overlays";

const STAGE_LABELS: Record<WritingStage, string> = {
  blank: "未开始",
  stance_undecided: "确定立场",
  outline_drafting: "构思大纲",
  intro_writing: "写引言",
  body_writing: "写主体段",
  near_completion: "接近完成",
  completed: "已完成",
};

const STAGE_COLORS: Record<WritingStage, string> = {
  blank: "bg-zinc-100 text-zinc-600",
  stance_undecided: "bg-amber-100 text-amber-700",
  outline_drafting: "bg-blue-100 text-blue-700",
  intro_writing: "bg-violet-100 text-violet-700",
  body_writing: "bg-indigo-100 text-indigo-700",
  near_completion: "bg-emerald-100 text-emerald-700",
  completed: "bg-emerald-200 text-emerald-800",
};

interface StageIndicatorProps {
  stage: WritingStage;
  className?: string;
}

export function StageIndicator({ stage, className }: StageIndicatorProps) {
  return (
    <div className={className}>
      <span className="text-xs text-muted-foreground mr-2">写作阶段</span>
      <Badge className={STAGE_COLORS[stage] ?? ""}>{STAGE_LABELS[stage] ?? stage}</Badge>
    </div>
  );
}
