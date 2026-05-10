"use client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Question {
  id: string;
  taskType: string;
  topic: string;
  difficultyTag?: string | null;
  tags?: string; // JSON string array
  prompt: string;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-800 border-emerald-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  hard: "bg-rose-100 text-rose-800 border-rose-200",
};

export function QuestionCard({ question }: { question: Question }) {
  let tags: string[] = [];
  try {
    tags = question.tags ? JSON.parse(question.tags) : [];
  } catch {}

  return (
    <Card className="p-4 bg-muted/50">
      <div className="flex flex-wrap gap-2 mb-2">
        <Badge variant="secondary">{question.taskType.toUpperCase()}</Badge>
        <Badge variant="outline" className="capitalize">
          {question.topic}
        </Badge>
        {question.difficultyTag && (
          <Badge
            className={
              DIFFICULTY_COLORS[question.difficultyTag] ??
              "bg-zinc-100 text-zinc-800"
            }
          >
            {DIFFICULTY_LABELS[question.difficultyTag] ?? question.difficultyTag}
          </Badge>
        )}
        {tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{question.prompt}</p>
    </Card>
  );
}
