import { db } from "@/db/client";
import { essays, gradingResults, questions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export interface RecentEssaySummary {
  id: string;
  questionPrompt: string;
  mode: string;
  state: string;
  wordCount: number;
  overallBand: number | null;
  createdAt: string;
  gradedAt: string | null;
}

export async function computeRecentEssays(
  _params: Record<string, unknown>
): Promise<RecentEssaySummary[]> {
  const rows = await db
    .select({
      id: essays.id,
      questionPrompt: questions.prompt,
      mode: essays.mode,
      state: essays.state,
      wordCount: essays.wordCount,
      overallBand: gradingResults.overallBand,
      createdAt: essays.createdAt,
      gradedAt: essays.gradedAt,
    })
    .from(essays)
    .leftJoin(questions, eq(questions.id, essays.questionId))
    .leftJoin(gradingResults, eq(gradingResults.essayId, essays.id))
    .orderBy(desc(essays.createdAt))
    .limit(10);

  return rows.map((r) => ({
    id: r.id,
    questionPrompt: r.questionPrompt ?? "(No question)",
    mode: r.mode,
    state: r.state,
    wordCount: r.wordCount,
    overallBand: r.overallBand ?? null,
    createdAt: r.createdAt?.toISOString() ?? "",
    gradedAt: r.gradedAt?.toISOString() ?? null,
  }));
}
