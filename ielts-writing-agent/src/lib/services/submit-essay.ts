import { db } from "@/db/client";
import { essays, gradingResults } from "@/db/schema";
import { eq } from "drizzle-orm";
import { runGradingAgent } from "../agents/grading-agent";
import { submitEssay, saveGradingResult } from "../repositories/essays";
import { appendEvent } from "../repositories/events";
import { getAllQuestionIds, getQuestionById } from "../repositories/questions";
import { logger } from "../utils/logger";
import { z } from "zod";

const SubmitInputSchema = z.object({
  essayId: z.string().min(1),
});

export async function submitEssayService(essayId: string): Promise<{ gradingResultId: string }> {
  SubmitInputSchema.parse({ essayId });

  // Load essay
  const essayRows = await db.select().from(essays).where(eq(essays.id, essayId)).limit(1);
  if (!essayRows.length) throw new Error(`Essay not found: ${essayId}`);
  const essay = essayRows[0];

  if (essay.state === "graded") {
    throw new Error("Essay is already graded");
  }
  if (!essay.body.trim()) {
    throw new Error("Essay body is empty");
  }
  if (essay.wordCount < 50) {
    throw new Error("Essay too short (min 50 words)");
  }
  if (essay.wordCount > 600) {
    throw new Error("Essay too long (max 600 words). Please shorten before submitting.");
  }

  // If submitted but no grading result (previous grading save failed), allow re-grading
  if (essay.state === "submitted") {
    const existing = await db.select().from(gradingResults).where(eq(gradingResults.essayId, essayId)).limit(1);
    if (existing.length > 0) throw new Error("Essay grading is already in progress or completed");
    logger.warn({ essayId }, "Essay in submitted state with no grading result — re-running grading");
  }

  // Load question
  const question = essay.questionId ? await getQuestionById(essay.questionId) : null;
  const questionPrompt = question?.prompt ?? "(No specific question provided)";

  // Mark as submitted (skip if already submitted)
  if (essay.state === "draft") {
    await submitEssay(essayId);
    await appendEvent("essay_submitted", essayId, "essay", { wordCount: essay.wordCount });
  }

  logger.info({ essayId, wordCount: essay.wordCount }, "Essay submitted, running grading agent");

  // Get available question IDs for recommendations
  const availableQuestionIds = await getAllQuestionIds();

  // Run grading agent
  const gradingResult = await runGradingAgent({
    questionPrompt,
    essayBody: essay.body,
    wordCount: essay.wordCount,
    mode: essay.mode as "real" | "assist",
    availableQuestionIds,
  });

  // Save all grading data in transaction
  const gradingResultId = await saveGradingResult(essayId, gradingResult);

  // Fire event
  await appendEvent("essay_graded", essayId, "essay", {
    gradingResultId,
    overallBand: gradingResult.output.overallBand,
    costUsd: gradingResult.costUsd,
  });

  logger.info(
    { essayId, gradingResultId, overallBand: gradingResult.output.overallBand },
    "Essay graded successfully"
  );

  return { gradingResultId };
}
