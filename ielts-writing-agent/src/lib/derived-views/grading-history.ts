import { db } from "@/db/client";
import { essays, gradingResults } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export interface GradingHistoryEntry {
  essayId: string;
  gradedAt: string;
  overallBand: number;
  taBand: number;
  ccBand: number;
  lrBand: number;
  graBand: number;
  costUsd: number;
  model: string;
}

export async function computeGradingHistory(
  _params: Record<string, unknown>
): Promise<GradingHistoryEntry[]> {
  const rows = await db
    .select({
      essayId: essays.id,
      gradedAt: essays.gradedAt,
      overallBand: gradingResults.overallBand,
      taBand: gradingResults.taBand,
      ccBand: gradingResults.ccBand,
      lrBand: gradingResults.lrBand,
      graBand: gradingResults.graBand,
      costUsd: gradingResults.costUsd,
      model: gradingResults.model,
    })
    .from(essays)
    .innerJoin(gradingResults, eq(gradingResults.essayId, essays.id))
    .orderBy(desc(essays.gradedAt))
    .limit(50);

  return rows.map((r) => ({
    essayId: r.essayId,
    gradedAt: r.gradedAt?.toISOString() ?? "",
    overallBand: r.overallBand,
    taBand: r.taBand,
    ccBand: r.ccBand,
    lrBand: r.lrBand,
    graBand: r.graBand,
    costUsd: r.costUsd,
    model: r.model,
  }));
}
