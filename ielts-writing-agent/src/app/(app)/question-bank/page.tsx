"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, PenLine } from "lucide-react";

interface Question {
  id: string;
  topic: string;
  prompt: string;
  difficultyTag: string | null;
  sampleBand: number | null;
  tags: string;
  source: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  hard: "bg-rose-100 text-rose-800",
};

export default function QuestionBankPage() {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const router = useRouter();

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ["questions", search, topic, difficulty],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (topic && topic !== "all") params.set("topic", topic);
      if (difficulty && difficulty !== "all") params.set("difficulty", difficulty);
      const res = await fetch(`/api/questions?${params}`);
      return res.json();
    },
    staleTime: 60_000,
  });

  const handleStartEssay = (question: Question, mode: "real" | "assist") => {
    router.push(`/write/${mode}/${question.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">题库</h1>
        <p className="text-muted-foreground text-sm mt-1">选择一道题目开始练习</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索题目..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={topic} onValueChange={(val) => setTopic(val ?? "all")}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="话题" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部话题</SelectItem>
            <SelectItem value="technology">科技</SelectItem>
            <SelectItem value="education">教育</SelectItem>
            <SelectItem value="environment">环境</SelectItem>
            <SelectItem value="health">健康</SelectItem>
            <SelectItem value="society">社会</SelectItem>
            <SelectItem value="work">工作</SelectItem>
            <SelectItem value="media">媒体</SelectItem>
            <SelectItem value="crime">犯罪</SelectItem>
            <SelectItem value="globalisation">全球化</SelectItem>
            <SelectItem value="urbanisation">城市化</SelectItem>
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={(val) => setDifficulty(val ?? "all")}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="难度" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部难度</SelectItem>
            <SelectItem value="easy">简单</SelectItem>
            <SelectItem value="medium">中等</SelectItem>
            <SelectItem value="hard">困难</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : questions && questions.length > 0 ? (
        <div className="space-y-3">
          {questions.map((q) => {
            const tags = JSON.parse(q.tags || "[]") as string[];
            return (
              <Card key={q.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-2 flex-wrap">
                    <Badge variant="outline" className="capitalize text-xs">{q.topic}</Badge>
                    {q.difficultyTag && (
                      <Badge className={`text-xs ${DIFFICULTY_COLORS[q.difficultyTag] ?? ""}`}>
                        {q.difficultyTag === "easy" ? "简单" : q.difficultyTag === "medium" ? "中等" : "困难"}
                      </Badge>
                    )}
                    {tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed mb-3">{q.prompt}</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleStartEssay(q, "assist")}>
                      <PenLine className="h-3 w-3 mr-1.5" />
                      辅助练习
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleStartEssay(q, "real")}>
                      正式模式
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p>没有找到匹配的题目</p>
          <p className="text-sm mt-1">请尝试其他搜索条件，或运行 npm run db:seed 导入题库</p>
        </div>
      )}
    </div>
  );
}
