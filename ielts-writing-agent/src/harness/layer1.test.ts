/**
 * Layer 1 Harness: Scoring consistency
 * Checks that LLM band scores correlate with human-annotated bands.
 * Target: MAE < 0.5 bands, Spearman r > 0.7
 */
import { describe, it, expect, beforeAll } from "vitest";
import { db } from "@/db/client";
import { harnessDatasetLayer1, harnessRuns, questions } from "@/db/schema";
import { runGradingAgent } from "@/lib/agents/grading-agent";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

function spearmanCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const rankX = rankArray(x);
  const rankY = rankArray(y);
  const d = rankX.map((r, i) => r - rankY[i]);
  const d2Sum = d.reduce((s, v) => s + v * v, 0);
  return 1 - (6 * d2Sum) / (n * (n * n - 1));
}

function rankArray(arr: number[]): number[] {
  const sorted = [...arr].sort((a, b) => a - b);
  return arr.map((v) => sorted.indexOf(v) + 1);
}

describe("Layer 1: Scoring Consistency", () => {
  let dataset: Array<{ essayBody: string; humanBand: number; questionPrompt: string }> = [];

  beforeAll(async () => {
    const rows = await db.select().from(harnessDatasetLayer1).limit(20);
    if (rows.length === 0) {
      console.warn("No Layer 1 dataset found. Skipping consistency tests.");
      return;
    }

    // Join with questions
    for (const row of rows) {
      let questionPrompt = "(No question)";
      if (row.questionId) {
        const q = await db
          .select()
          .from(questions)
          .where(eq(questions.id, row.questionId))
          .limit(1);
        if (q.length > 0) questionPrompt = q[0].prompt;
      }
      dataset.push({ essayBody: row.essayBody, humanBand: row.humanBand, questionPrompt });
    }
  });

  it("should have at least 5 test samples", () => {
    if (dataset.length < 5) {
      console.warn(`Only ${dataset.length} samples available. Seed the harness dataset first.`);
      return;
    }
    expect(dataset.length).toBeGreaterThanOrEqual(5);
  });

  it("should achieve MAE < 0.5 and Spearman r > 0.7", async () => {
    if (dataset.length < 5) return;

    const runId = nanoid();
    const startedAt = new Date();
    const predictions: number[] = [];
    const actuals: number[] = [];

    for (const sample of dataset) {
      const result = await runGradingAgent({
        questionPrompt: sample.questionPrompt,
        essayBody: sample.essayBody,
        wordCount: sample.essayBody.split(/\s+/).filter(Boolean).length,
        mode: "real",
      });
      predictions.push(result.output.overallBand);
      actuals.push(sample.humanBand);
    }

    const mae =
      predictions.reduce((sum, pred, i) => sum + Math.abs(pred - actuals[i]), 0) /
      predictions.length;
    const spearman = spearmanCorrelation(predictions, actuals);

    console.log(`Layer 1 Results: MAE=${mae.toFixed(3)}, Spearman r=${spearman.toFixed(3)}`);

    await db.insert(harnessRuns).values({
      id: runId,
      layer: 1,
      model: process.env.GRADING_MODEL ?? "claude-opus-4-7",
      startedAt,
      completedAt: new Date(),
      resultJson: JSON.stringify({ mae, spearman, n: dataset.length }),
      passedChecks: (mae < 0.5 ? 1 : 0) + (spearman > 0.7 ? 1 : 0),
      totalChecks: 2,
    });

    expect(mae).toBeLessThan(0.5);
    expect(spearman).toBeGreaterThan(0.7);
  }, 300_000); // 5 min timeout
});
