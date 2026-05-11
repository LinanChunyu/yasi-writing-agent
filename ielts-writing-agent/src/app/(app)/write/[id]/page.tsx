"use client";
import { useEffect, use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEssayStore } from "@/stores/essay-store";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useStageDetector } from "@/hooks/use-stage-detector";
import { EssayEditor } from "@/components/essay/EssayEditor";
import { Timer } from "@/components/essay/Timer";
import { CoachChat } from "@/components/coach/CoachChat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Send, Timer as TimerIcon } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function WritePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    essayId,
    questionPrompt,
    body,
    mode,
    timerRunning,
    setEssayId,
    setQuestion,
    setMode,
    startTimer,
    stopTimer,
    reset,
  } = useEssayStore();

  useAutoSave();

  const { data: essayData, isLoading } = useQuery({
    queryKey: ["essay", id],
    queryFn: async () => {
      const res = await fetch(`/api/essays/${id}`);
      if (!res.ok) throw new Error("Failed to load essay");
      return res.json();
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (essayData && !isLoading) {
      const { essay, grading } = essayData;
      if (grading) {
        router.replace(`/feedback/${id}`);
        return;
      }
      setEssayId(essay.id);
      setMode(essay.mode);
      if (essay.questionId && essayData.question) {
        setQuestion(essay.questionId, essayData.question.prompt ?? "");
      }
    }
  }, [essayData, isLoading, id, router, setEssayId, setMode, setQuestion]);

  const stage = useStageDetector(body, !!questionPrompt);

  const handleSubmit = async () => {
    if (!essayId || body.trim().split(/\s+/).filter(Boolean).length < 150) {
      toast.warning("文章至少需要 150 字才能提交");
      return;
    }
    setSubmitting(true);
    stopTimer();
    try {
      const res = await fetch(`/api/essays/${essayId}/submit`, { method: "POST" });
      if (!res.ok) throw new Error("Submit failed");
      toast.success("提交成功，正在批改...");
      router.push(`/feedback/${essayId}`);
    } catch (e) {
      toast.error("提交失败，请重试");
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  const wordCount = body.split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Question prompt */}
      {questionPrompt && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-blue-800 mb-1">Task 2 Question</p>
          <p className="text-sm text-blue-900 leading-relaxed">{questionPrompt}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Badge variant={mode === "real" ? "default" : "secondary"}>
            {mode === "real" ? "正式模式" : "辅助模式"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            阶段: {stage}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Timer />
          <Button
            size="sm"
            variant="outline"
            onClick={timerRunning ? stopTimer : startTimer}
          >
            <TimerIcon className="h-3 w-3 mr-1.5" />
            {timerRunning ? "暂停计时" : "开始计时"}
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={submitting || wordCount < 150}>
            <Send className="h-3 w-3 mr-1.5" />
            {submitting ? "批改中..." : "提交批改"}
          </Button>
        </div>
      </div>

      <div className={`grid gap-4 ${mode === "assist" ? "grid-cols-[1fr_380px]" : "grid-cols-1"}`}>
        <EssayEditor disabled={submitting} />
        {mode === "assist" && essayId && (
          <CoachChat
            essayId={essayId}
            questionPrompt={questionPrompt}
            essayBody={body}
            className="h-[calc(100vh-280px)] sticky top-20"
          />
        )}
      </div>
    </div>
  );
}
