import { nanoid } from "nanoid";
import { db } from "../client";
import * as schema from "../schema";
import questionsData from "../../../data/kb-source/questions.json";
import rubricData from "../../../data/kb-source/rubric-items.json";
import errorPatternsData from "../../../data/kb-source/error-patterns.json";

async function main() {
  console.log("Seeding KB tables...");

  // Questions
  for (const q of questionsData) {
    await db
      .insert(schema.questions)
      .values({
        id: q.id,
        source: q.source,
        topic: q.topic,
        taskType: q.taskType,
        prompt: q.prompt,
        sampleBand: q.sampleBand ?? null,
        difficultyTag: q.difficultyTag ?? null,
        tags: JSON.stringify(q.tags),
      })
      .onConflictDoNothing();
  }
  console.log(`  ${questionsData.length} questions seeded`);

  // Rubric items
  for (const r of rubricData) {
    await db
      .insert(schema.rubricItems)
      .values({
        id: r.id,
        criterion: r.criterion,
        band: r.band,
        descriptor: r.descriptor,
        exampleGood: r.exampleGood ?? null,
        exampleBad: r.exampleBad ?? null,
      })
      .onConflictDoNothing();
  }
  console.log(`  ${rubricData.length} rubric items seeded`);

  // Error patterns
  for (const e of errorPatternsData) {
    await db
      .insert(schema.errorPatterns)
      .values({
        id: e.id,
        category: e.category,
        tag: e.tag,
        description: e.description,
        exampleBad: e.exampleBad,
        exampleGood: e.exampleGood,
        fix: e.fix,
      })
      .onConflictDoNothing();
  }
  console.log(`  ${errorPatternsData.length} error patterns seeded`);

  console.log("Seed complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
