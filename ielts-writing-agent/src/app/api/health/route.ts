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

  // Test API connectivity with a minimal request (no actual tokens wasted)
  try {
    const client = new Anthropic({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
    });
    // Use models.list() to verify auth — much cheaper than a message
    await client.models.list();
    checks.apiConnectivity = "ok";
  } catch (err: unknown) {
    checks.apiConnectivity = "error";
    checks.apiError =
      err instanceof Error ? err.message : String(err);
  }

  // Test DB
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
