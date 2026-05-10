import { db } from "@/db/client";
import { errorPatterns, essayErrors, essays } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";

export interface DailyTip {
  tag: string;
  category: string;
  description: string;
  exampleBad: string;
  exampleGood: string;
  fix: string;
}

export async function computeDailyTip(
  _params: Record<string, unknown>
): Promise<DailyTip | null> {
  // Find the most common error category from recent essays
  const topError = await db
    .select({ tag: essayErrors.tag, category: essayErrors.category, cnt: count(essayErrors.id) })
    .from(essayErrors)
    .innerJoin(essays, eq(essays.id, essayErrors.essayId))
    .groupBy(essayErrors.tag, essayErrors.category)
    .orderBy(desc(count(essayErrors.id)))
    .limit(1);

  if (topError.length === 0) {
    // Fallback to a random error pattern
    const patterns = await db.select().from(errorPatterns).limit(1);
    if (patterns.length === 0) return null;
    const p = patterns[0];
    return {
      tag: p.tag,
      category: p.category,
      description: p.description,
      exampleBad: p.exampleBad,
      exampleGood: p.exampleGood,
      fix: p.fix,
    };
  }

  const pattern = await db
    .select()
    .from(errorPatterns)
    .where(eq(errorPatterns.tag, topError[0].tag))
    .limit(1);

  if (pattern.length === 0) return null;
  const p = pattern[0];
  return {
    tag: p.tag,
    category: p.category,
    description: p.description,
    exampleBad: p.exampleBad,
    exampleGood: p.exampleGood,
    fix: p.fix,
  };
}
