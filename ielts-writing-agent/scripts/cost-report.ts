/**
 * Cost report script
 * Usage: npm run cost:report
 */
import { db } from "../src/db/client";
import { gradingResults, coachMessages, harnessRuns } from "../src/db/schema";
import { sum } from "drizzle-orm";

async function main() {
  const [gradingCost] = await db
    .select({ total: sum(gradingResults.costUsd) })
    .from(gradingResults);

  const [coachCost] = await db
    .select({ total: sum(coachMessages.costUsd) })
    .from(coachMessages);

  const [harnessCost] = await db
    .select({ total: sum(harnessRuns.costUsd) })
    .from(harnessRuns);

  const totalGrading = Number(gradingCost?.total ?? 0);
  const totalCoach = Number(coachCost?.total ?? 0);
  const totalHarness = Number(harnessCost?.total ?? 0);
  const totalAll = totalGrading + totalCoach + totalHarness;

  console.log("\n=== IELTS Writing Agent — Cost Report ===\n");
  console.log(`Grading Agent:  $${totalGrading.toFixed(4)}`);
  console.log(`Coach Agent:    $${totalCoach.toFixed(4)}`);
  console.log(`Harness Runs:   $${totalHarness.toFixed(4)}`);
  console.log("─".repeat(32));
  console.log(`Total:          $${totalAll.toFixed(4)}`);
  console.log();
}

main().catch(console.error);
