"use client";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useEssayStore } from "@/stores/essay-store";
import { useEssayInit } from "@/hooks/use-essay-init";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useStageDetector } from "@/hooks/use-stage-detector";
import { EssayEditor } from "@/components/essay/EssayEditor";
import { CoachChat } from "@/components/coach/CoachChat";
import { StageIndicator } from "@/components/stage-indicator";
import { QuestionCard } from "@/components/question-card";
import { Timer } from "@/components/essay/Timer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Send, Timer as TimerIcon } from "lucide-react";

interface PageProps {
  params: Promise<{ questionId: string }>;
}

export default function WriteAssistPage({ params }: PageProps) {
  const { questionId } = use(params);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const { body, essayId, timerRunning, startTimer, stopTimer } = useEssayStore();

  useEssayInit({ questionId, mode: "assist" });
  useAutoSave();

  const { data: question, isLoading: qLoading } = useQuery({
    queryKey: ["question", questionId],
    queryFn: () => fetch(`/api/questions/${questionId}`).then((r) => r.json()),
    staleTime: Infinity,
  });

  const stage = useStageDetector(body, !!question);

  const wordCount = body.split(/\s+/).filter(Boolean).length;

  const handleSubmit = async () => {
    if (!essayId || wordCount < 150) {
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
    } catch {
      toast.error("提交失败，请重试");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 max-w-7xl mx-auto">
      {/* Question card */}
      {qLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        question && <QuestionCard question={question} />
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <StageIndicator stage={stage} />
        <div className="flex items-center gap-3">
          <Timer />
          <Button
            size="sm"
            variant="outline"
            onClick={timerRunning ? stopTimer : startTimer}
          >
            <TimerIcon className="h-3 w-3 mr-1.5" />
            {timerRunning ? "暂停" : "计时"}
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || !essayId || wordCount < 10}
          >
            <Send className="h-3 w-3 mr-1.5" />
            {submitting ? "批改中..." : "提交批改"}
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EssayEditor disabled={submitting} className="min-h-[500px]" />
        {essayId && question && (
          <CoachChat
            essayId={essayId}
            questionPrompt={question.prompt ?? ""}
            essayBody={body}
            className="h-[calc(100vh-380px)] min-h-[400px] sticky top-20"
          />
        )}
      </div>
    </div>
  );
}
