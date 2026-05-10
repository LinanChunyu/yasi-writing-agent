"use client";
import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEssayStore } from "@/stores/essay-store";
import { useEssayInit } from "@/hooks/use-essay-init";
import { useAutoSave } from "@/hooks/use-auto-save";
import { EssayEditor } from "@/components/essay/EssayEditor";
import { QuestionCard } from "@/components/question-card";
import { Timer } from "@/components/essay/Timer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Send, Timer as TimerIcon, AlertTriangle } from "lucide-react";

interface PageProps {
  params: Promise<{ questionId: string }>;
}

export default function WriteRealPage({ params }: PageProps) {
  const { questionId } = use(params);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const { body, essayId, timerRunning, startTimer, stopTimer } = useEssayStore();

  useEssayInit({ questionId, mode: "real" });
  useAutoSave();

  const { data: question, isLoading: qLoading } = useQuery({
    queryKey: ["question", questionId],
    queryFn: () => fetch(`/api/questions/${questionId}`).then((r) => r.json()),
    staleTime: Infinity,
  });

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
    <div className="flex flex-col gap-3 max-w-4xl mx-auto">
      {/* Exam mode warning */}
      <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>仿真模式 — 无 AI 辅助，模拟真实考试环境</span>
      </div>

      {/* Question card */}
      {qLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        question && <QuestionCard question={question} />
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{wordCount} 词</span>
        <div className="flex items-center gap-3">
          <Timer limit={40 * 60} />
          <Button
            size="sm"
            variant="outline"
            onClick={timerRunning ? stopTimer : startTimer}
          >
            <TimerIcon className="h-3 w-3 mr-1.5" />
            {timerRunning ? "暂停" : "开始计时"}
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

      <EssayEditor disabled={submitting} className="min-h-[500px]" />
    </div>
  );
}
