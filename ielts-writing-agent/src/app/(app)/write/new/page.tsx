"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEssayStore } from "@/stores/essay-store";

export default function NewWritePage() {
  const router = useRouter();
  const reset = useEssayStore((s) => s.reset);

  useEffect(() => {
    reset();
    fetch("/api/essays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "assist" }),
    })
      .then((r) => r.json())
      .then(({ id }) => router.replace(`/write/${id}`));
  }, [router, reset]);

  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground">创建练习...</p>
    </div>
  );
}
