"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Pencil, Library, Loader2 } from "lucide-react";

export function QuickActions() {
  const router = useRouter();
  const [loading, setLoading] = useState<"assist" | "real" | null>(null);

  const handleQuickWrite = async (mode: "real" | "assist") => {
    setLoading(mode);
    try {
      const res = await fetch("/api/questions/random");
      if (!res.ok) {
        router.push("/question-bank");
        return;
      }
      const q = await res.json();
      router.push(`/write/${mode}/${q.id}`);
    } catch {
      router.push("/question-bank");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Button
        onClick={() => handleQuickWrite("assist")}
        variant="default"
        className="h-auto py-4 flex flex-col gap-1"
        disabled={!!loading}
      >
        {loading === "assist" ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Pencil className="h-5 w-5" />
        )}
        <span>随机来一题（辅助）</span>
      </Button>
      <Button
        onClick={() => handleQuickWrite("real")}
        variant="outline"
        className="h-auto py-4 flex flex-col gap-1"
        disabled={!!loading}
      >
        {loading === "real" ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Pencil className="h-5 w-5" />
        )}
        <span>随机来一题（仿真）</span>
      </Button>
      <Button
        onClick={() => router.push("/question-bank")}
        variant="outline"
        className="h-auto py-4 flex flex-col gap-1"
        disabled={!!loading}
      >
        <Library className="h-5 w-5" />
        <span>去题库选题</span>
      </Button>
    </div>
  );
}
