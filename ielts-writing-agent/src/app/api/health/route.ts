import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const baseURL = process.env.ANTHROPIC_BASE_URL;

  const checks: Record<string, unknown> = {
    apiKeyPresent: !!apiKey,
    apiKeyPrefix: apiKey?.slice(0, 10) ?? null,
    baseURL: baseURL ?? "(anthropic default)",
    gradingModel: process.env.GRADING_MODEL ?? "deepseek-v4-pro",
    coachModel: process.env.COACH_MODEL ?? "deepseek-v4-flash",
    nodeEnv: process.env.NODE_ENV,
  };

  // Test with a real minimal messages call (1 output token)
  try {
    const client = new Anthropic({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
    });

    const msg = await client.messages.create({
      model: process.env.COACH_MODEL ?? "deepseek-v4-flash",
      max_tokens: 64,
      messages: [{ role: "user", content: "Reply with just the number 1." }],
    });

    const textBlock = msg.content.find((b) => b.type === "text");
    const text = textBlock?.type === "text" ? textBlock.text : "(no text block)";
    checks.apiConnectivity = "ok";
    checks.apiTestReply = text.trim();
    checks.apiInputTokens = msg.usage.input_tokens;
    checks.apiOutputTokens = msg.usage.output_tokens;
  } catch (err: unknown) {
    checks.apiConnectivity = "error";
    checks.apiError = err instanceof Error ? err.message : String(err);
  }

  // DB check
  try {
    const { db } = await import("@/db/client");
    const { questions } = await import("@/db/schema");
    const { count } = await import("drizzle-orm");
    const [row] = await db.select({ cnt: count(questions.id) }).from(questions);
    checks.dbQuestionsCount = row?.cnt ?? 0;
    checks.dbConnectivity = "ok";
  } catch (err: unknown) {
    checks.dbConnectivity = "error";
    checks.dbError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(checks);
}
