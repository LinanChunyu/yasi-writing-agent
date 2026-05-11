import { db } from "@/db/client";
import {
  essays,
  gradingResults,
  essayErrors,
  essayRewrites,
  recommendedQuestions,
  translationDrills,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { GradingResult } from "../agents/grading-agent";

export async function createEssay(data: {
  questionId?: string;
  mode: "real" | "assist";
  body?: string;
}): Promise<string> {
  const id = nanoid();
  await db.insert(essays).values({
    id,
    questionId: data.questionId ?? null,
    mode: data.mode,
    body: data.body ?? "",
    wordCount: data.body ? data.body.split(/\s+/).filter(Boolean).length : 0,
    state: "draft",
  });
  return id;
}

export async function updateEssayBody(
  essayId: string,
  body: string
): Promise<void> {
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  await db.update(essays).set({ body, wordCount }).where(eq(essays.id, essayId));
}

export async function submitEssay(essayId: string): Promise<void> {
  await db
    .update(essays)
    .set({ state: "submitted", submittedAt: new Date() })
    .where(eq(essays.id, essayId));
}

export async function saveGradingResult(
  essayId: string,
  result: GradingResult
): Promise<string> {
  const gradingId = nanoid();
  const output = result.output;

  // All writes in a single atomic transaction — if any step fails, nothing is saved
  db.transaction((tx) => {
    tx.insert(gradingResults).values({
      id: gradingId,
      essayId,
      overallBand: output.overallBand,
      taBand: output.taBand,
      ccBand: output.ccBand,
      lrBand: output.lrBand,
      graBand: output.graBand,
      taComment: output.taComment,
      ccComment: output.ccComment,
      lrComment: output.lrComment,
      graComment: output.graComment,
      overallComment: output.overallComment,
      strengthsSummary: output.strengthsSummary,
      weaknessesSummary: output.weaknessesSummary,
      rewrittenEssay: output.rewrittenEssay ?? null,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      costUsd: result.costUsd,
      model: result.model,
      rawJson: result.rawJson,
    }).run();

    if (output.errors.length > 0) {
      tx.insert(essayErrors).values(
        output.errors.map((err) => ({
          id: nanoid(),
          essayId,
          gradingResultId: gradingId,
          category: err.category,
          tag: err.tag,
          offsetStart: err.offsetStart,
          offsetEnd: err.offsetEnd,
          originalText: err.originalText,
          suggestion: err.suggestion,
          explanation: err.explanation,
          severity: err.severity,
        }))
      ).run();
    }

    if (output.rewrites.length > 0) {
      tx.insert(essayRewrites).values(
        output.rewrites.map((rw) => ({
          id: nanoid(),
          essayId,
          gradingResultId: gradingId,
          paragraph: rw.paragraph,
          originalText: rw.originalText,
          rewrittenText: rw.rewrittenText,
          explanation: rw.explanation,
        }))
      ).run();
    }

    if (output.recommendedQuestions.length > 0) {
      tx.insert(recommendedQuestions).values(
        output.recommendedQuestions.map((rq, i) => ({
          id: nanoid(),
          essayId,
          questionId: rq.questionId,
          reason: rq.reason,
          rank: i + 1,
        }))
      ).run();
    }

    if (output.translationDrills.length > 0) {
      tx.insert(translationDrills).values(
        output.translationDrills.map((drill) => ({
          id: nanoid(),
          essayId,
          chineseSentence: drill.chineseSentence,
          targetEnglish: drill.targetEnglish,
          grammarFocus: drill.grammarFocus,
        }))
      ).run();
    }

    tx.update(essays)
      .set({ state: "graded", gradedAt: new Date() })
      .where(eq(essays.id, essayId))
      .run();
  });

  return gradingId;
}

export async function getEssayWithGrading(essayId: string) {
  const essay = await db.select().from(essays).where(eq(essays.id, essayId)).limit(1);
  if (!essay.length) return null;

  const grading = await db
    .select()
    .from(gradingResults)
    .where(eq(gradingResults.essayId, essayId))
    .limit(1);

  const errors = await db
    .select()
    .from(essayErrors)
    .where(eq(essayErrors.essayId, essayId));

  const rewrites = await db
    .select()
    .from(essayRewrites)
    .where(eq(essayRewrites.essayId, essayId));

  const drills = await db
    .select()
    .from(translationDrills)
    .where(eq(translationDrills.essayId, essayId));

  return {
    essay: essay[0],
    grading: grading[0] ?? null,
    errors,
    rewrites,
    drills,
  };
}
