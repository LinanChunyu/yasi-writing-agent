import { NextRequest } from "next/server";
import { z } from "zod";
import { streamCoachResponse } from "@/lib/agents/coach-agent";
import { getOrCreateThread, getThreadMessages, appendMessage } from "@/lib/repositories/coach-threads";
import { detectStage } from "@/lib/stage-detector";
import { logger } from "@/lib/utils/logger";

const MessageSchema = z.object({
  essayId: z.string().min(1),
  questionPrompt: z.string().min(1),
  essayBody: z.string(),
  userMessage: z.string().min(1),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof MessageSchema>;
  try {
    body = MessageSchema.parse(await req.json());
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { essayId, questionPrompt, essayBody, userMessage } = body;
  const stage = detectStage(essayBody, { hasQuestion: !!questionPrompt });

  const threadId = await getOrCreateThread(essayId);
  const history = await getThreadMessages(threadId);

  // Save user message
  await appendMessage({ threadId, role: "user", content: userMessage, stage });

  let resolvedUsage: { inputTokens: number; outputTokens: number; costUsd: number } | null = null;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await streamCoachResponse({
          essayBody,
          questionPrompt,
          stage,
          history: history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
          userMessage,
          threadId,
        });

        let fullResponse = "";

        for await (const chunk of result.stream) {
          fullResponse += chunk;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
        }

        resolvedUsage = await result.getUsage();

        // Save assistant message
        await appendMessage({
          threadId,
          role: "assistant",
          content: fullResponse,
          stage,
          inputTokens: resolvedUsage.inputTokens,
          outputTokens: resolvedUsage.outputTokens,
          costUsd: resolvedUsage.costUsd,
        });

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, stage })}\n\n`)
        );
      } catch (err) {
        logger.error({ err }, "Coach stream error");
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
