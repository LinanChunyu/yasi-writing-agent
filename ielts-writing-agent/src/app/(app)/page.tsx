"use client";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDerivedView } from "@/hooks/use-derived-view";
import type { ScoreTrendPoint } from "@/lib/derived-views/score-trend";
import type { DailyTip } from "@/lib/derived-views/daily-tip";
import type { RecentEssaySummary } from "@/lib/derived-views/recent-essays";
import { TrendingUp, Lightbulb, Clock, PenLine } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { QuickActions } from "@/components/quick-actions";

export default function HomePage() {
  const { data: trend, isLoading: trendLoading } = useDerivedView<ScoreTrendPoint[]>("scoreTrend");
  const { data: tip } = useDerivedView<DailyTip | null>("dailyTip");
  const { data: recent, isLoading: recentLoading } = useDerivedView<RecentEssaySummary[]>("recentEssays");

  const latestBand = trend && trend.length > 0 ? trend[trend.length - 1].overallBand : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">欢迎回来</h1>
          <p className="text-muted-foreground text-sm mt-1">坚持练习，提升雅思写作成绩</p>
        </div>
      </div>
      <QuickActions />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              最新成绩
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendLoading ? (
              <Skeleton className="h-12 w-20" />
            ) : latestBand ? (
              <span className="text-4xl font-bold text-primary">{latestBand.toFixed(1)}</span>
            ) : (
              <span className="text-muted-foreground text-sm">暂无数据</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <PenLine className="h-4 w-4 text-primary" />
              练习次数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-4xl font-bold text-primary">
              {trend?.length ?? 0}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              进步趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trend && trend.length >= 2 ? (
              <div>
                <span className={`text-2xl font-bold ${
                  trend[trend.length - 1].overallBand >= trend[0].overallBand
                    ? "text-emerald-600"
                    : "text-rose-500"
                }`}>
                  {trend[trend.length - 1].overallBand >= trend[0].overallBand ? "↑" : "↓"}{" "}
                  {Math.abs(trend[trend.length - 1].overallBand - trend[0].overallBand).toFixed(1)}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">需要更多数据</span>
            )}
          </CardContent>
        </Card>
      </div>

      {tip && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
              <Lightbulb className="h-4 w-4" />
              今日提示 — {tip.category}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm font-medium text-amber-900">{tip.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-rose-50 border border-rose-200 rounded p-2">
                <p className="font-medium text-rose-700 mb-1">错误示例</p>
                <p className="text-rose-800">{tip.exampleBad}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded p-2">
                <p className="font-medium text-emerald-700 mb-1">正确示例</p>
                <p className="text-emerald-800">{tip.exampleGood}</p>
              </div>
            </div>
            <p className="text-xs text-amber-700">{tip.fix}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            最近练习
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : recent && recent.length > 0 ? (
            <div className="space-y-2">
              {recent.slice(0, 5).map((essay) => (
                <Link
                  key={essay.id}
                  href={essay.state === "graded" ? `/feedback/${essay.id}` : `/write/${essay.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{essay.questionPrompt}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {essay.wordCount} 词 · {essay.mode === "real" ? "正式模式" : "辅助模式"}
                      {essay.createdAt && ` · ${formatDistanceToNow(new Date(essay.createdAt), { addSuffix: true, locale: zhCN })}`}
                    </p>
                  </div>
                  {essay.overallBand && (
                    <span className="ml-4 font-bold text-primary text-lg">
                      {essay.overallBand.toFixed(1)}
                    </span>
                  )}
                  {essay.state === "submitted" && (
                    <span className="ml-4 text-xs text-muted-foreground">批改中...</span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">还没有练习记录</p>
              <Link href="/question-bank" className={cn(buttonVariants({ size: "sm" }), "mt-4 inline-flex")}>
                开始第一篇练习
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
