"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EssayError {
  id: string;
  category: string;
  tag: string;
  originalText: string;
  suggestion: string;
  explanation: string;
  severity: string;
}

interface ErrorListProps {
  errors: EssayError[];
}

const CATEGORY_COLORS: Record<string, string> = {
  grammar: "bg-rose-100 text-rose-800",
  vocabulary: "bg-violet-100 text-violet-800",
  coherence: "bg-amber-100 text-amber-800",
  task: "bg-blue-100 text-blue-800",
};

const SEVERITY_COLORS: Record<string, string> = {
  major: "border-rose-300",
  minor: "border-zinc-200",
};

export function ErrorList({ errors }: ErrorListProps) {
  if (errors.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No errors detected. Great work!
      </p>
    );
  }

  const major = errors.filter((e) => e.severity === "major");
  const minor = errors.filter((e) => e.severity === "minor");

  return (
    <div className="space-y-3">
      {major.length > 0 && (
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Major Errors ({major.length})
        </p>
      )}
      {[...major, ...minor].map((err) => (
        <Card key={err.id} className={cn("border", SEVERITY_COLORS[err.severity])}>
          <CardHeader className="py-3 px-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn("text-xs", CATEGORY_COLORS[err.category] ?? "")}>
                {err.category}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">{err.tag}</span>
              {err.severity === "major" && (
                <Badge variant="destructive" className="text-xs ml-auto">Major</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-3 space-y-2">
            <div className="text-sm">
              <span className="line-through text-muted-foreground">{err.originalText}</span>
              {" → "}
              <span className="font-medium text-emerald-700">{err.suggestion}</span>
            </div>
            <p className="text-xs text-muted-foreground">{err.explanation}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
