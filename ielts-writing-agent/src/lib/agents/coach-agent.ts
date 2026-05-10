import Anthropic from "@anthropic-ai/sdk";
import { env } from "../utils/env";
import { logger } from "../utils/logger";
import { calcCostUsd } from "../utils/cost";
import { COACH_SYSTEM_PROMPT } from "./prompts/coach-system";
import { getStageOverlay } from "./prompts/coach-stage-overlays";
import type { CoachStreamInput } from "./types/coach";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  ...(process.env.ANTHROPIC_BASE_URL ? { baseURL: process.env.ANTHROPIC_BASE_URL } : {}),
});

export interface CoachStreamResult {
  stream: AsyncIterable<string>;
  getUsage: () => Promise<{ inputTokens: number; outputTokens: number; costUsd: number }>;
}

export async function streamCoachResponse(input: CoachStreamInput): Promise<CoachStreamResult> {
  const model = env.COACH_MODEL;
  const baseURL = process.env.ANTHROPIC_BASE_URL ?? "(anthropic default)";
  const keyPrefix = process.env.ANTHROPIC_API_KEY?.slice(0, 10) ?? "(missing)";
  console.log(`[coach] model=${model} baseURL=${baseURL} keyPrefix=${keyPrefix} threadId=${input.threadId}`);

  const stageOverlay = getStageOverlay(input.stage);

  const systemPrompt = COACH_SYSTEM_PROMPT;

  const contextMessage = `[ESSAY CONTEXT]
Question: ${input.questionPrompt}

Current Essay Draft (${input.essayBody.split(/\s+/).filter(Boolean).length} words):
${input.essayBody || "(empty)"}

${stageOverlay}`;

  const messages: Anthropic.MessageParam[] = [
    ...input.history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    {
      role: "user",
      content: `${contextMessage}\n\n---\n\nStudent message: ${input.userMessage}`,
    },
  ];

  let resolveUsage: (value: { inputTokens: number; outputTokens: number; costUsd: number }) => void;
  const usagePromise = new Promise<{ inputTokens: number; outputTokens: number; costUsd: number }>(
    (resolve) => { resolveUsage = resolve; }
  );

  const anthropicStream = await client.messages.stream({
    model,
    max_tokens: 800,
    system: systemPrompt,
    messages,
  });

  async function* generateTokens(): AsyncIterable<string> {
    let inputTokens = 0;
    let outputTokens = 0;

    for await (const event of anthropicStream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
      if (event.type === "message_delta" && event.usage) {
        outputTokens = event.usage.output_tokens;
      }
      if (event.type === "message_start" && event.message.usage) {
        inputTokens = event.message.usage.input_tokens;
      }
    }

    const costUsd = calcCostUsd({ inputTokens, outputTokens, model });
    logger.info({ threadId: input.threadId, inputTokens, outputTokens, costUsd }, "Coach stream complete");
    resolveUsage!({ inputTokens, outputTokens, costUsd });
  }

  return {
    stream: generateTokens(),
    getUsage: () => usagePromise,
  };
}
