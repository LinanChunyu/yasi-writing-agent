"use client";
import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  stage?: string;
}

export function useChatThread(essayId: string, questionPrompt: string, essayBody: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [stage, setStage] = useState<string>("blank");
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (streaming) return;

      setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
      setStreaming(true);

      let assistantContent = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/coach/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ essayId, questionPrompt, essayBody, userMessage }),
          signal: abortRef.current.signal,
        });

        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                assistantContent += data.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                  return updated;
                });
              }
              if (data.done && data.stage) {
                setStage(data.stage);
              }
            } catch {}
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Chat error:", err);
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: "Sorry, an error occurred. Please try again.",
            };
            return updated;
          });
        }
      } finally {
        setStreaming(false);
      }
    },
    [essayId, questionPrompt, essayBody, streaming]
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, streaming, stage, sendMessage, abort };
}
