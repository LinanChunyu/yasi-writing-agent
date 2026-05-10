"use client";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ScoreCard } from "@/components/feedback/ScoreCard";
import { ErrorList } from "@/components/feedback/ErrorList";
import { RewritePanel } from "@/components/feedback/RewritePanel";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, PenLine, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FeedbackPage({ params }: PageProps) {
  const { id } = use(params);

  const { data, isLoading, error } = useQuery({
    queryKey: ["essay-grading", id],
    queryFn: async () => {
      const res = await fetch(`/api/essays/${id}/grading`);
      if (res.status === 404) {
        const body = await res.json();
        if (body.error === "Not graded yet") return null;
        throw new Error("Not found");
      }
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    refetchInterval: (query) => {
      if (!query.state.data?.grading) return 3000;
      return false;
    },
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data || !data.grading) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">AI 正在批改您的文章，请稍候...</p>
        <p className="text-xs text-muted-foreground">通常需要 30-60 秒</p>
      </div>
    );
  }

  const { essay, grading, errors, rewrites, drills } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          返回主页
        </Link>
        <Link href="/question-bank" className={cn(buttonVariants({ size: "sm" }))}>
          <PenLine className="h-4 w-4 mr-1.5" />
          继续练习
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">您的文章</CardTitle>
            <Badge variant="outline">{essay.wordCount} 词</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {essay.body}
          </p>
        </CardContent>
      </Card>

      <ScoreCard
        overallBand={grading.overallBand}
        taBand={grading.taBand}
        ccBand={grading.ccBand}
        lrBand={grading.lrBand}
        graBand={grading.graBand}
        taComment={grading.taComment}
        ccComment={grading.ccComment}
        lrComment={grading.lrComment}
        graComment={grading.graComment}
        overallComment={grading.overallComment}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-emerald-50 border-emerald-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-emerald-800">优点</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-emerald-900">{grading.strengthsSummary}</p>
          </CardContent>
        </Card>
        <Card className="bg-rose-50 border-rose-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-rose-800">改进点</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-rose-900">{grading.weaknessesSummary}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="errors">
        <TabsList>
          <TabsTrigger value="errors">错误分析 ({errors?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="rewrites">段落改写 ({rewrites?.length ?? 0})</TabsTrigger>
          {drills?.length > 0 && (
            <TabsTrigger value="drills">翻译练习 ({drills.length})</TabsTrigger>
          )}
          {grading.rewrittenEssay && (
            <TabsTrigger value="full-rewrite">全文改写</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="errors" className="mt-4">
          <ErrorList errors={errors ?? []} />
        </TabsContent>

        <TabsContent value="rewrites" className="mt-4">
          <RewritePanel rewrites={rewrites ?? []} />
        </TabsContent>

        {drills?.length > 0 && (
          <TabsContent value="drills" className="mt-4">
            <div className="space-y-3">
              {drills.map((drill: { id: string; chineseSentence: string; targetEnglish: string; grammarFocus: string }) => (
                <Card key={drill.id}>
                  <CardContent className="pt-4 space-y-2">
                    <p className="text-sm font-medium text-blue-700">{drill.chineseSentence}</p>
                    <p className="text-sm border-t pt-2">{drill.targetEnglish}</p>
                    <Badge variant="secondary" className="text-xs">{drill.grammarFocus}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}

        {grading.rewrittenEssay && (
          <TabsContent value="full-rewrite" className="mt-4">
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="pt-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{grading.rewrittenEssay}</p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
