import { db } from "@/db/client";
import { coachThreads, coachMessages } from "@/db/schema";
import { nanoid } from "nanoid";
import { eq, asc } from "drizzle-orm";
import type { WritingStage } from "../agents/prompts/coach-stage-overlays";

export async function getOrCreateThread(essayId: string): Promise<string> {
  const existing = await db
    .select()
    .from(coachThreads)
    .where(eq(coachThreads.essayId, essayId))
    .limit(1);

  if (existing.length > 0) return existing[0].id;

  const id = nanoid();
  await db.insert(coachThreads).values({ id, essayId, stage: "blank" });
  return id;
}

export async function getThreadMessages(threadId: string) {
  return db
    .select()
    .from(coachMessages)
    .where(eq(coachMessages.threadId, threadId))
    .orderBy(asc(coachMessages.createdAt));
}

export async function appendMessage(data: {
  threadId: string;
  role: "user" | "assistant";
  content: string;
  stage: string;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
}): Promise<string> {
  const id = nanoid();
  await db.insert(coachMessages).values({
    id,
    threadId: data.threadId,
    role: data.role,
    content: data.content,
    stage: data.stage,
    inputTokens: data.inputTokens ?? 0,
    outputTokens: data.outputTokens ?? 0,
    costUsd: data.costUsd ?? 0,
  });
  await db
    .update(coachThreads)
    .set({ stage: data.stage, updatedAt: new Date() })
    .where(eq(coachThreads.id, data.threadId));
  return id;
}
