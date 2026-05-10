"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, BookMarked } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface WordbookEntry {
  id: string;
  word: string;
  definition: string;
  exampleSentence: string;
  ieltsFrequency: string | null;
  addedAt: string | number;
}

const FREQ_COLORS: Record<string, string> = {
  high: "bg-emerald-100 text-emerald-800",
  medium: "bg-blue-100 text-blue-800",
  low: "bg-zinc-100 text-zinc-800",
};

export default function WordbookPage() {
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [example, setExample] = useState("");
  const qc = useQueryClient();

  const { data: words, isLoading } = useQuery<WordbookEntry[]>({
    queryKey: ["wordbook"],
    queryFn: async () => {
      const res = await fetch("/api/wordbook?limit=100");
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/wordbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, definition, exampleSentence: example }),
      });
      if (!res.ok) throw new Error("Failed to add word");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wordbook"] });
      toast.success(`"${word}" 已加入词汇本`);
      setWord("");
      setDefinition("");
      setExample("");
      setOpen(false);
    },
    onError: () => toast.error("添加失败"),
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookMarked className="h-6 w-6" />
            词汇本
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            共 {words?.length ?? 0} 个词汇
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className={cn(buttonVariants())}>
            <Plus className="h-4 w-4 mr-1.5" />
            添加词汇
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新词汇</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>单词</Label>
                <Input value={word} onChange={(e) => setWord(e.target.value)} placeholder="e.g. exacerbate" />
              </div>
              <div>
                <Label>定义</Label>
                <Input value={definition} onChange={(e) => setDefinition(e.target.value)} placeholder="中文或英文释义" />
              </div>
              <div>
                <Label>例句</Label>
                <Textarea value={example} onChange={(e) => setExample(e.target.value)} placeholder="例句..." />
              </div>
              <Button
                className="w-full"
                onClick={() => addMutation.mutate()}
                disabled={!word || !definition || !example || addMutation.isPending}
              >
                {addMutation.isPending ? "添加中..." : "添加"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : words && words.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {words.map((entry) => (
            <Card key={entry.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="pt-4 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-base">{entry.word}</span>
                  {entry.ieltsFrequency && (
                    <Badge className={`text-xs ${FREQ_COLORS[entry.ieltsFrequency] ?? ""}`}>
                      {entry.ieltsFrequency === "high" ? "高频" : entry.ieltsFrequency === "medium" ? "中频" : "低频"}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{entry.definition}</p>
                <p className="text-xs text-muted-foreground italic border-t pt-1">{entry.exampleSentence}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(typeof entry.addedAt === "number" ? entry.addedAt * 1000 : entry.addedAt), {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <BookMarked className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>词汇本是空的</p>
          <p className="text-sm mt-1">批改完文章后可以收藏好词好句</p>
        </div>
      )}
    </div>
  );
}
