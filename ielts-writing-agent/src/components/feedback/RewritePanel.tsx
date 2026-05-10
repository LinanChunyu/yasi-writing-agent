"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EssayRewrite {
  id: string;
  paragraph: number;
  originalText: string;
  rewrittenText: string;
  explanation: string;
}

interface RewritePanelProps {
  rewrites: EssayRewrite[];
}

export function RewritePanel({ rewrites }: RewritePanelProps) {
  if (rewrites.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No rewrites generated.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {rewrites.map((rw) => (
        <Card key={rw.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Paragraph {rw.paragraph} Rewrite</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Original</p>
              <p className="text-sm text-muted-foreground bg-muted rounded p-3 leading-relaxed">
                {rw.originalText}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-700 mb-1 uppercase tracking-wider">Improved</p>
              <p className="text-sm bg-emerald-50 border border-emerald-200 rounded p-3 leading-relaxed">
                {rw.rewrittenText}
              </p>
            </div>
            <p className="text-xs text-muted-foreground border-t pt-2">{rw.explanation}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
