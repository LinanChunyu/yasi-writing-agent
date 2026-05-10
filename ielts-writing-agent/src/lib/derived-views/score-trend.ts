import { db } from "@/db/client";
import { essays, gradingResults } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export interface ScoreTrendPoint {
  essayId: string;
  date: string;
  overallBand: number;
  taBand: number;
  ccBand: number;
  lrBand: number;
  graBand: number;
}

export async function computeScoreTrend(
  _params: Record<string, unknown>
): Promise<ScoreTrendPoint[]> {
  const rows = await db
    .select({
      essayId: essays.id,
      gradedAt: essays.gradedAt,
      overallBand: gradingResults.overallBand,
      taBand: gradingResults.taBand,
      ccBand: gradingResults.ccBand,
      lrBand: gradingResults.lrBand,
      graBand: gradingResults.graBand,
    })
    .from(essays)
    .innerJoin(gradingResults, eq(gradingResults.essayId, essays.id))
    .where(eq(essays.state, "graded"))
    .orderBy(desc(essays.gradedAt))
    .limit(20);

  return rows.map((r) => ({
    essayId: r.essayId,
    date: r.gradedAt?.toISOString().slice(0, 10) ?? "",
    overallBand: r.overallBand,
    taBand: r.taBand,
    ccBand: r.ccBand,
    lrBand: r.lrBand,
    graBand: r.graBand,
  })).reverse();
}
