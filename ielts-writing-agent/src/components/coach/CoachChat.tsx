"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import { useChatThread } from "@/hooks/use-chat-thread";
import { cn } from "@/lib/utils";
import { SendHorizontal, Loader2 } from "lucide-react";

interface CoachChatProps {
  essayId: string;
  questionPrompt: string;
  essayBody: string;
  className?: string;
}

const STAGE_LABELS: Record<string, string> = {
  blank: "开始",
  stance_undecided: "确定立场",
  outline_drafting: "构思大纲",
  intro_writing: "写引言",
  body_writing: "写主体段",
  near_completion: "接近完成",
  completed: "已完成",
};

export function CoachChat({ essayId, questionPrompt, essayBody, className }: CoachChatProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { messages, streaming, stage, sendMessage } = useChatThread(essayId, questionPrompt, essayBody);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("flex flex-col h-full border rounded-lg bg-card", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="font-semibold text-sm">AI 写作教练</span>
        <Badge variant="secondary" className="text-xs">
          {STAGE_LABELS[stage] ?? stage}
        </Badge>
      </div>

      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-sm text-center mt-8">
            向教练提问，获得写作指导...
          </p>
        )}
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted prose prose-sm max-w-none"
                )}
              >
                {msg.role === "assistant" ? (
                  <ReactMarkdown>{msg.content || "▍"}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <Separator />
      <div className="p-3 flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="向教练提问... (Enter 发送)"
          className="flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[60px] max-h-[120px]"
          disabled={streaming}
        />
        <Button size="icon" onClick={handleSend} disabled={streaming || !input.trim()}>
          {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
